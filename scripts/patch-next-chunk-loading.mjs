import fs from "fs";
import path from "path";

const targetFile = path.resolve("node_modules/next/dist/client/app-webpack.js");

if (fs.existsSync(targetFile)) {
  let content = fs.readFileSync(targetFile, "utf-8");
  if (!content.includes("static/chunks/' + chunkId + '.js'")) {
    const original = `(0, _encodeuripath.encodeURIPath)(getChunkScriptFilename(...args))`;
    const replacement = `(() => {
        var fn = getChunkScriptFilename(...args);
        if (!fn && args[0]) {
          var cid = String(args[0]);
          if (cid.startsWith('app/') || cid.startsWith('pages/') || cid === 'app-pages-internals') {
            fn = 'static/chunks/' + cid + '.js';
          }
        }
        return (0, _encodeuripath.encodeURIPath)(fn);
      })()`;
    content = content.replaceAll(original, replacement);
    fs.writeFileSync(targetFile, content, "utf-8");
    console.log("✓ Applied chunk filename fallback patch to next/dist/client/app-webpack.js");
  }
}
