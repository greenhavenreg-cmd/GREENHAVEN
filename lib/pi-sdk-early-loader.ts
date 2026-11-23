/**
 * RUN375: early Pi SDK loader for authenticated routes.
 *
 * Regression context: the field-research public-access work removed the global
 * `<Script src="https://sdk.minepi.com/pi-sdk.js" strategy="beforeInteractive">`
 * from the root layout so public respondents never load Pi. The SDK was then
 * fetched only after hydration. Archives RUN249 (0.338.20) and RUN302 (0.338.86),
 * where Pi sign-in worked, both loaded the SDK before the page became
 * interactive. This restores that timing for authenticated routes only; public
 * routes (policy owned by lib/routing/public-route-policy.ts) still load no Pi SDK.
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
if(!pub&&/^\\/r\\/[^/]+\\/?$/.test(p))pub=true;
if(!pub&&(p==="/field"||p==="/field/"))pub=true;
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
