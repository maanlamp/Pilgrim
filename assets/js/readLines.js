const fs = require("fs");

function readLines (file, nLines, cb) {
	const stream = fs.createReadStream(file, "utf8");
	const chunks = [];
	
	return new Promise((resolve, reject) => {
		stream.on("error", error => {
			reject(err);
		});
	
		stream.on("end", () => {
			resolve(chunks.join());
		});
	
		stream.on("data", data => {
			chunks.push(data);
			const lines = chunks.reduce((lines, chunk) => lines + chunk.split("\n").length, 0);
			if (lines >= nLines) {
				if (lines > nLines) {
					stream.destroy();
					const txt = chunks.join();
					const len = txt.length;
					let i = 0;
					while (nLines-- && ++i < len) {
						i = txt.indexOf("\n", i);
						if (i < 0) break;
					}
					resolve(txt.slice(0, i));
				} else {
					resolve(txt);
				}
			}
		});
	});
}
module.exports.readLines = readLines;