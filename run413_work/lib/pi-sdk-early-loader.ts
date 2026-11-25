/**
 * RUN375: early Pi SDK loader for authenticated routes.
 *
 * Loads the official Pi SDK before hydration on every service route. Only
 * legal/help documents and the Pi domain-validation resource remain public.
 *
 * Dependency-free on purpose so it can be executed in a regression test.
 */
export function buildPiSdkEarlyLoaderScript(sdkUrl: string, publicPrefixes: readonly string[]): string {
  const url = JSON.stringify(sdkUrl)
  const prefixes = JSON.stringify(publicPrefixes)
  return `(function(){try{
var p=(location.pathname||"/");
var pre=${prefixes};
var pub=false;
if(p!=="/"){
for(var i=0;i<pre.length;i++){if(p===pre[i]||p.indexOf(pre[i]+"/")===0){pub=true;break}}
}
if(pub)return;
if(window.Pi)return;
var src=${url};
if(document.querySelector('script[src="'+src+'"]'))return;
var s=document.createElement("script");
s.src=src;s.async=false;
(document.head||document.documentElement).appendChild(s);
}catch(e){}})();`
}
