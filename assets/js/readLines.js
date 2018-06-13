const fs = require("fs");
const chardet = require("chardet");

function readLines (file, nLines, cb) {
	return new Promise((resolve, reject) => {
		const encoding = chardet.detectFileSync(file, { sampleSize: 1024 });
		let stream;
		try {
			stream = fs.createReadStream(file, encoding);
		} catch (err) {
			try {
				stream = fs.createReadStream(file, "utf-8");
			} catch (err) {
				reject(err);
			}
		}
		const chunks = [];
	
		stream.on("error", error => reject(error));
		stream.on("end", () => {
			const txt = chunks.join();
			resolve({
				lines: txt,
				encoding: encoding
			});
		});
		stream.on("data", data => {
			chunks.push(data);
			const lines = chunks.reduce((lines, chunk) => lines + chunk.split("\n").length, 0);
			if (lines >= nLines) {
				stream.destroy();
				const txt = chunks.join();
				if (lines > nLines) {
					const len = txt.length;
					let i = 0;
					while (nLines-- && ++i < len) {
						i = txt.indexOf("\n", i);
						if (i < 0) break;
					}
					resolve({
						lines: txt.slice(0, i),
						encoding: encoding
					});
				} else {
					resolve({
						lines: txt,
						encoding: encoding
					});
				}
			}
		});
	});
}
module.exports.readLines = readLines;