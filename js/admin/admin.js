

(function(){
    'use strict';

    function waitForElements(selectors, timeout = 2000) {
        return new Promise(function(resolve, reject) {
            var t = 0, interval = 50;
            var handle = setInterval(function() {
                var all = selectors.every(function(s) { return document.querySelector(s); });
                if (all) {
                    clearInterval(handle);
                    resolve(selectors.map(function(s) { return document.querySelector(s); }));
                }
                t += interval;
                if (t >= timeout) {
                    clearInterval(handle);
                    reject(new Error('Timed out waiting for elements: ' + selectors.join(', ')));
                }
            }, interval);
        });
    }

    // Execute inline <script> tags inside a container
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

    function setActiveMenu(name) {
        // if name provided, set that item active; otherwise pick the first
        var items = document.querySelectorAll('.sidebar-item');
        items.forEach(function(it){
            it.classList.remove('active');
            it.removeAttribute('aria-current');
        });
        var found;
        if (name) found = document.querySelector('.sidebar-item[data-name="' + name + '"]');
        if (!found) found = document.querySelector('.sidebar-item[data-view]');
        if (found) {
            found.classList.add('active');
            found.setAttribute('aria-current','page');
        }
    }

    function loadView(url, pushStateName) {
        var main = document.getElementById('admin-main');
        if (!main) return;
        fetch(url).then(function(res){
            if(!res.ok) throw new Error('View not found: ' + url);
            return res.text();
        }).then(function(html){
            main.innerHTML = html;
            runScripts(main);
            // re-init any bootstrap components if necessary (e.g., tooltips)
            // update active menu
            if (pushStateName) setActiveMenu(pushStateName);
        }).catch(function(err){
            main.innerHTML = '<p class="text-danger">Error cargando la vista: ' + err.message + '</p>';
            console.error(err);
        });
    }

    function init() {
        waitForElements(['.sidebar', '#admin-main']).then(function(){
            var sidebar = document.querySelector('.sidebar');
            var items = sidebar.querySelectorAll('.sidebar-item[data-view]');

            items.forEach(function(item){
                item.addEventListener('click', function(ev){
                    // If it's an anchor, prevent full navigation so SPA can handle it
                    if (ev && typeof ev.preventDefault === 'function') ev.preventDefault();
                    var view = item.getAttribute('data-view');
                    var name = item.getAttribute('data-name');
                    loadView(view, name);
                    // Update URL state
                    window.history.pushState({view: view, name: name}, '', '?view=' + (name || ''));
                });
                // Support keyboard users (Enter/Space) for anchors, in case default behaviour differs
                item.addEventListener('keydown', function(ev){
                    if (ev.key === 'Enter' || ev.key === ' ') {
                        ev.preventDefault();
                        item.click();
                    }
                });
            });

            // On popstate, load view from state or from query param
            window.addEventListener('popstate', function(ev){
                var view = (ev.state && ev.state.view) || getViewFromQuery() || items[0].getAttribute('data-view');
                var name = (ev.state && ev.state.name) || getNameFromView(view);
                loadView(view, name);
            });

            // Initial view: check query string
            var defaultView = getViewFromQuery() || items[0].getAttribute('data-view');
            var derivedName = getNameFromView(defaultView);
            setActiveMenu(derivedName);
            loadView(defaultView, derivedName);
        }).catch(function(err){
            console.warn('Admin layout not ready:', err.message);
        });
    }

    function getViewFromQuery() {
        var params = new URLSearchParams(window.location.search);
        var v = params.get('view');
        if (!v) return null;
        // Map short names to view paths
        var name = v.toLowerCase();
        var map = {
            'dashboard': '/modules/admin/dashboard-content.html',
            'nourse': '/modules/admin/nourse-content.html',
            'patient': '/modules/admin/patient-content.html',
            'assignments': '/modules/admin/assignments-content.html',
            'rooms': '/modules/admin/rooms-content.html',
            'beds': '/modules/admin/beds-content.html'
        };
        return map[name] || null;
    }

    function getNameFromView(view) {
        if (!view) return null;
        if (view.indexOf('dashboard') !== -1) return 'dashboard';
        if (view.indexOf('nourse') !== -1) return 'nourse';
        if (view.indexOf('patient') !== -1) return 'patient';
        if (view.indexOf('assignments') !== -1) return 'assignments';
        if (view.indexOf('beds') !== -1) return 'beds';
        return null;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();