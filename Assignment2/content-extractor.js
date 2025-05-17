// Content extraction functionality

// Extract content from the current page
function extractPageContent() {
  console.log("Extracting page content...");
  
  // Get page metadata
  const metadata = extractPageMetadata();
  
  // Get main content with improved extraction
  const mainContent = extractMainContent();
  
  // Get product information if available
  const productInfo = extractProductInfo();
  
  // Return structured content
  const content = {
    metadata: metadata,
    mainContent: mainContent,
    productInfo: productInfo
  };
  
  console.log("Extracted content:", content);
  return content;
}

// Extract page metadata
function extractPageMetadata() {
  return {
    title: document.title,
    url: window.location.href,
    domain: window.location.hostname,
    language: document.documentElement.lang || 'en',
    lastUpdated: document.lastModified
  };
}

// Extract main content from the page with improved methods
function extractMainContent() {
  console.log("Extracting main content...");
  
  // Try multiple methods to get the most content
  let mainText = "";
  let headings = [];
  
  // Method 1: Try to find the main content area using common selectors
  const mainContentSelectors = [
    'main',
    'article',
    '#content',
    '.content',
    '.main-content',
    '#main-content',
    // Canvas-specific selectors
    '#wiki_page_show',
    '.user_content',
    '.content-wrapper',
    '.canvas-content',
    '.page-content',
    '.module-content',
    '.assignment-content',
    '.discussion-content'
  ];
  
  let mainContentElement = null;
  
  // Try each selector until we find a match
  for (const selector of mainContentSelectors) {
    const elements = document.querySelectorAll(selector);
    if (elements && elements.length > 0) {
      // Use the largest element by content length
      let largestElement = elements[0];
      let largestLength = elements[0].textContent.length;
      
      for (let i = 1; i < elements.length; i++) {
        if (elements[i].textContent.length > largestLength) {
          largestElement = elements[i];
          largestLength = elements[i].textContent.length;
        }
      }
      
      mainContentElement = largestElement;
      break;
    }
  }
  
  // Method 2: If no main content area found, try to identify the main content by analyzing the page structure
  if (!mainContentElement) {
    console.log("No main content element found with selectors, trying alternative method");
    
    // Get all paragraphs and content blocks
    const contentBlocks = document.querySelectorAll('p, .content-block, .section, .module, .card, .item');
    
    // Find the area with the most text content
    if (contentBlocks.length > 0) {
      let bestBlock = contentBlocks[0];
      let bestLength = contentBlocks[0].textContent.length;
      
      for (let i = 1; i < contentBlocks.length; i++) {
        if (contentBlocks[i].textContent.length > bestLength) {
          bestBlock = contentBlocks[i];
          bestLength = contentBlocks[i].textContent.length;
        }
      }
      
      mainContentElement = bestBlock.parentElement;
    }
  }
  
  // Method 3: If still no content found, use the body but try to exclude navigation, headers, footers
  if (!mainContentElement || mainContentElement.textContent.trim().length < 100) {
    console.log("Using body as main content with exclusions");
    mainContentElement = document.body;
  }
  
  // Extract text content from the main element
  if (mainContentElement) {
    mainText = extractTextFromElement(mainContentElement);
  }
  
  // Extract all headings from the page
  headings = extractHeadings();
  
  // Extract sections based on headings
  const sections = extractSections(headings);
  
  return {
    text: mainText,
    headings: headings,
    sections: sections
  };
}

// Extract text from an element, excluding scripts, styles, etc.
function extractTextFromElement(element) {
  // Clone the element to avoid modifying the original
  const clone = element.cloneNode(true);
  
  // Remove scripts, styles, and other non-content elements
  const elementsToRemove = clone.querySelectorAll('script, style, noscript, iframe, svg, nav, footer, header, .navigation, .nav, .menu, .sidebar, .footer, .header');
  elementsToRemove.forEach(el => el.remove());
  
  // Get text content
  return clone.textContent.trim().replace(/\s+/g, ' ');
}

// Extract headings from the page
function extractHeadings() {
  const headings = [];
  const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, .heading, .title, .subtitle');
  
  headingElements.forEach(heading => {
    // Get heading level
    let level = 0;
    if (heading.tagName.match(/H[1-6]/)) {
      level = parseInt(heading.tagName.substring(1));
    } else if (heading.classList.contains('title')) {
      level = 1;
    } else if (heading.classList.contains('subtitle')) {
      level = 2;
    } else {
      level = 3; // Default for other heading classes
    }
    
    headings.push({
      level: level,
      text: heading.textContent.trim(),
      element: heading
    });
  });
  
  return headings;
}

// Extract sections based on headings
function extractSections(headings) {
  const sections = [];
  
  if (headings.length === 0) {
    // If no headings, treat the whole page as one section
    sections.push({
      title: document.title,
      content: document.body.textContent.trim().replace(/\s+/g, ' ')
    });
    return sections;
  }
  
  // Add all headings as section markers
  for (let i = 0; i < headings.length; i++) {
    const heading = headings[i];
    const nextHeading = headings[i + 1];
    let sectionContent = "";
    
    // Get all content between this heading and the next one of same or higher level
    let currentNode = heading.element;
    while (currentNode && currentNode.nextSibling) {
      currentNode = currentNode.nextSibling;
      
      // Stop if we've reached the next heading of same or higher level
      if (currentNode.nodeType === 1 && // Element node
          currentNode.tagName && currentNode.tagName.match(/H[1-6]/) && 
          parseInt(currentNode.tagName.substring(1)) <= heading.level) {
        break;
      }
      
      // Add text content if it's not a script or style
      if (currentNode.nodeType === 3 || // Text node
          (currentNode.nodeType === 1 && 
           !currentNode.tagName.match(/^(SCRIPT|STYLE|NAV|HEADER|FOOTER)$/))) {
        sectionContent += currentNode.textContent + " ";
      }
    }
    
    sections.push({
      title: heading.text,
      content: sectionContent.trim()
    });
  }
  
  return sections;
}

// Extract product information if the page is an e-commerce product page
function extractProductInfo() {
  // Check if this looks like a product page
  const hasProductElements = document.querySelector('[itemtype*="Product"], .product, #product, [data-product-id]');
  
  if (!hasProductElements) {
    return null;
  }
  
  // Try to extract product name
  const productNameSelectors = [
    '[itemprop="name"]',
    '.product-title',
    '.product-name',
    '#product-title',
    'h1'
  ];
  
  let productName = null;
  for (const selector of productNameSelectors) {
    const element = document.querySelector(selector);
    if (element) {
      productName = element.textContent.trim();
      break;
    }
  }
  
  // Try to extract price
  const priceSelectors = [
    '[itemprop="price"]',
    '.price',
    '.product-price',
    '#price'
  ];
  
  let price = null;
  for (const selector of priceSelectors) {
    const element = document.querySelector(selector);
    if (element) {
      price = element.textContent.trim();
      break;
    }
  }
  
  // Try to extract description
  const descriptionSelectors = [
    '[itemprop="description"]',
    '.product-description',
    '#product-description'
  ];
  
  let description = null;
  for (const selector of descriptionSelectors) {
    const element = document.querySelector(selector);
    if (element) {
      description = element.textContent.trim();
      break;
    }
  }
  
  return {
    productName: productName,
    price: price,
    description: description
  };
}

// Extract content from iframes if possible
function extractIframeContent() {
  const iframes = document.querySelectorAll('iframe');
  let iframeContent = "";
  
  iframes.forEach(iframe => {
    try {
      // Try to access iframe content (may fail due to same-origin policy)
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      iframeContent += iframeDoc.body.textContent + " ";
    } catch (e) {
      console.log("Could not access iframe content due to security restrictions");
    }
  });
  
  return iframeContent.trim();
}

// Add this function to specifically extract techniques
function extractTechniques(sectionContent) {
  const techniques = [];
  
  // Look for common patterns that indicate techniques
  const paragraphs = sectionContent.split(/\n+/);
  
  paragraphs.forEach(paragraph => {
    // Look for technique names (often in bold, as list items, or at paragraph starts)
    const techniqueMatches = paragraph.match(/\b([A-Z][A-Za-z0-9]+([-][A-Z][A-Za-z0-9]+)*)\b/g);
    if (techniqueMatches) {
      techniques.push(...techniqueMatches);
    }
    
    // Look for numbered or bulleted techniques
    if (paragraph.match(/^[\d\.\•\-\*]\s+([A-Z][\w\s]+):/)) {
      const techniqueName = paragraph.match(/^[\d\.\•\-\*]\s+([A-Z][\w\s]+):/)[1];
      techniques.push(techniqueName);
    }
  });
  
  return [...new Set(techniques)]; // Remove duplicates
} 