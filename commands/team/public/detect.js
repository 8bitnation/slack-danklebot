(function() {
    // detect essential features used by event.js
    var hasDefineProperty = !!Object.defineProperty;
    var hasPromise = !!window.Promise;
    // 
    if(!hasDefineProperty || !hasPromise) {
        var el = document.getElementById('detect');
        if(el) {
            el.style.display = "block";
        }
        
    }
})();