class ContextProcessor {
  constructor() {
    this.pageContext = null;
  }
  
  // Process the extracted page content to create context
  processPageContent(pageContent) {
    console.log("Processing page content:", pageContent);
    
    // Determine page type
    const pageType = this.determinePageType(pageContent);
    
    // Extract main concepts
    const mainConcepts = this.extractMainConcepts(pageContent);
    
    // Create context object
    this.pageContext = {
      title: pageContent.metadata.title,
      url: pageContent.metadata.url,
      domain: pageContent.metadata.domain,
      pageType: pageType,
      mainConcepts: mainConcepts,
      product: pageContent.productInfo,
      mainContent: pageContent.mainContent
    };
    
    console.log("Processed context:", this.pageContext);
    return this.pageContext;
  }
  
  // Get the current page context
  getPageContext() {
    return this.pageContext;
  }
  
  // Determine the type of page based on content and URL
  determinePageType(pageContent) {
    const url = pageContent.metadata.url;
    const domain = pageContent.metadata.domain;
    const content = pageContent.mainContent.text;
    
    // Check for e-commerce
    if (pageContent.productInfo || 
        domain.includes('shop') || 
        domain.includes('store') ||
        url.includes('/product/') ||
        content.includes('Add to Cart') ||
        content.includes('Buy Now')) {
      return 'e-commerce';
    }
    
    // Check for technical documentation
    if (domain.includes('docs') ||
        url.includes('/docs/') ||
        url.includes('/documentation/') ||
        url.includes('/api/') ||
        content.includes('function(') ||
        content.includes('npm install')) {
      return 'technical-documentation';
    }
    
    // Check for research paper
    if (content.includes('Abstract') &&
        (content.includes('Conclusion') || content.includes('References')) &&
        (content.includes('et al.') || content.includes('Fig.'))) {
      return 'research-paper';
    }
    
    // Default to general
    return 'general';
  }
  
  // Extract main concepts from the page content
  extractMainConcepts(pageContent) {
    const concepts = [];
    
    // Add headings as concepts
    if (pageContent.mainContent.headings) {
      pageContent.mainContent.headings.forEach(heading => {
        if (heading.level <= 2) {  // Only use h1 and h2
          concepts.push(heading.text);
        }
      });
    }
    
    // If we have product info, add product name
    if (pageContent.productInfo && pageContent.productInfo.productName) {
      concepts.push(pageContent.productInfo.productName);
    }
    
    // If we don't have enough concepts, extract from title
    if (concepts.length < 2 && pageContent.metadata.title) {
      const titleWords = pageContent.metadata.title.split(' ');
      if (titleWords.length > 3) {
        // Use the first 3-4 words of the title as a concept
        concepts.push(titleWords.slice(0, Math.min(4, titleWords.length)).join(' '));
      } else {
        concepts.push(pageContent.metadata.title);
      }
    }
    
    return concepts;
  }
  
  // Generate a summary of the page content
  generateSummary() {
    if (!this.pageContext) {
      return 'No page context available.';
    }
    
    let summary = `This page is about ${this.pageContext.mainConcepts.join(', ')}. `;
    
    if (this.pageContext.mainContent && this.pageContext.mainContent.text) {
      // Add a brief excerpt from the main content
      const excerpt = this.pageContext.mainContent.text.substring(0, 200);
      summary += `Here's a brief excerpt: "${excerpt}..."`;
    }
    
    switch (this.pageContext.pageType) {
      case 'e-commerce':
        if (this.pageContext.product) {
          summary += `It's a product page for ${this.pageContext.product.productName || 'a product'}`;
          if (this.pageContext.product.price) {
            summary += ` priced at ${this.pageContext.product.price}`;
          }
          summary += '.';
        } else {
          summary += "It's an e-commerce page.";
        }
        break;
        
      case 'technical-documentation':
        summary += "It's a technical documentation page.";
        break;
        
      case 'research-paper':
        summary += "It's a research paper.";
        break;
        
      default:
        summary += `It's from the domain ${this.pageContext.domain}.`;
    }
    
    return summary;
  }
} 