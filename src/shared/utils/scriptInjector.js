// ponytail: Helper to dynamically inject arbitrary custom marketing scripts into head/body.

export function injectScripts(scriptsObj) {
  if (!scriptsObj) return;

  const positions = {
    head: document.head,
    body_start: document.body, // will prepend
    body_end: document.body,   // will append
  };

  Object.entries(scriptsObj).forEach(([pos, htmlContent]) => {
    if (!htmlContent || typeof htmlContent !== 'string') return;
    
    const parentNode = positions[pos];
    if (!parentNode) return;

    // Check if script group was already injected
    const dataAttribute = `data-injected-${pos}`;
    if (document.querySelector(`[${dataAttribute}]`)) return;

    // Create wrapper node to hold custom HTML content
    const wrapper = document.createElement('div');
    wrapper.style.display = 'none';
    wrapper.setAttribute(dataAttribute, 'true');
    wrapper.innerHTML = htmlContent;

    // We must execute any script tags manually since innerHTML doesn't trigger execution
    const scriptTags = wrapper.querySelectorAll('script');
    scriptTags.forEach((oldScript) => {
      const newScript = document.createElement('script');
      
      // Copy all attributes
      Array.from(oldScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });
      
      // Copy text content (inline script content)
      newScript.textContent = oldScript.textContent;
      
      // Replace old element with execute-ready script tag
      oldScript.parentNode.replaceChild(newScript, oldScript);
    });

    // Append to target layout location
    if (pos === 'body_start') {
      parentNode.insertBefore(wrapper, parentNode.firstChild);
    } else {
      parentNode.appendChild(wrapper);
    }
  });
}
