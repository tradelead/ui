function MockFile() { }

MockFile.prototype.create = function (name, size, mimeType) {
  // eslint-disable-next-line no-param-reassign
  name = name || 'mock.txt';
  // eslint-disable-next-line no-param-reassign
  size = size || 1024;
  // eslint-disable-next-line no-param-reassign
  mimeType = mimeType || 'plain/txt';

  function range(count) {
    let output = '';
    for (let i = 0; i < count; i += 1) {
      output += 'a';
    }
    return output;
  }

  const blob = new Blob([range(size)], { type: mimeType });
  blob.lastModifiedDate = new Date();
  blob.name = name;

  return blob;
};

export default MockFile;
