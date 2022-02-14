document.getElementById("btn").addEventListener("click", function(){
    chrome.tabs.executeScript(null, {
        'file': '/script.js'
    });
});