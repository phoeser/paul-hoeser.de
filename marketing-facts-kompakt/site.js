function mfkTheme(){var r=document.documentElement,n=(r.getAttribute('data-theme')||'dark')==='light'?'dark':'light';r.setAttribute('data-theme',n);try{localStorage.setItem('mfk-theme',n)}catch(e){}}
document.addEventListener('play',function(e){document.querySelectorAll('audio').forEach(function(a){if(a!==e.target)a.pause()})},true);
