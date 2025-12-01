(function() {
    'use strict';

    function loadIncludes() {
        var includeElements = document.querySelectorAll('[data-include]');
        if (includeElements.length === 0) return;

        includeElements.forEach(function(el) {
            var src = el.getAttribute('data-include');
            if (!src) return;
            var url = new URL(src, window.location.origin + window.location.pathname);
            fetch(url.toString()).then(function(response) {
                if (!response.ok) throw new Error('Not found: ' + src);
                return response.text();
            }).then(function(html) {
                el.innerHTML = html;
                runScripts(el);
            }).catch(function(err){
                console.error('Error including:', src, err);
            });
        });
    }

    function runScripts(container) {
        var scripts = container.querySelectorAll('script');
        scripts.forEach(function(oldScript){
            var newScript = document.createElement('script');
            for (var i = 0; i < oldScript.attributes.length; i++) {
                var attr = oldScript.attributes[i];
                newScript.setAttribute(attr.name, attr.value);
            }
            newScript.text = oldScript.textContent;
            oldScript.parentNode.replaceChild(newScript, oldScript);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadIncludes);
    } else {
        loadIncludes();
    }
})();