document.getElementById('fileInput').addEventListener('change', () => {
    const fileInput = document.getElementById('fileInput');
    const output = document.getElementById('output');
    const downloadBtn = document.getElementById('downloadBtn');

    if (fileInput.files.length === 0) {
        alert('Please select a file.');
        return;
    }

    const file = fileInput.files[0];

    if (!file.name.match(/\.(afphoto|afdesign)$/i)) {
        alert('Please select a .afphoto or .afdesign file.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        const arrayBuffer = event.target.result;
        const binaryData = new Uint8Array(arrayBuffer);

        const images = extractPngs(binaryData);
        if (images.length > 0) {
            const outputImage = images.reduce((a, b) => a.byteLength < b.byteLength ? a : b);
            const blob = new Blob([outputImage], { type: 'image/png' });
            const url = URL.createObjectURL(blob);

            const img = document.createElement('img');
            img.src = url;
            output.innerHTML = '';
            output.appendChild(img);

            downloadBtn.href = url;
            downloadBtn.download = file.name.replace(/\.(afphoto|afdesign)$/i, '.png');
            downloadBtn.style.display = 'inline-block';
        } else {
            output.textContent = 'No PNG images found in the file.';
            downloadBtn.style.display = 'none';
        }
    };
    reader.readAsArrayBuffer(file);
});

function extractPngs(binaryData) {
    const images = [];
    const numBytes = binaryData.length;

    for (let i = 0; i < numBytes; i++) {
        if (
            binaryData[i] === 0x89 &&
            binaryData[i + 1] === 0x50 &&
            binaryData[i + 2] === 0x4E &&
            binaryData[i + 3] === 0x47 &&
            binaryData[i + 4] === 0x0D &&
            binaryData[i + 5] === 0x0A &&
            binaryData[i + 6] === 0x1A &&
            binaryData[i + 7] === 0x0A
        ) {
            const pngSize = binaryData[i + 8] |
                (binaryData[i + 9] << 8) |
                (binaryData[i + 10] << 16) |
                (binaryData[i + 11] << 24);
            const pngData = binaryData.slice(i, i + pngSize + 8);
            images.push(pngData);
        }
    }

    return images;
}