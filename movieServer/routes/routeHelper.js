//Takes a string and makes clean array of error messages
function errorParser(errorString) {
  errorString = errorString.slice(errorString.indexOf(":") + 1);
  let errorArray = errorString.split(",");
  for (let i = 0; i < errorArray.length; i++) {
    let e = errorArray[i];
    errorArray[i] = e.slice(e.indexOf(":") + 1).trim();
  }
  return errorArray;
}

module.exports = { errorParser };
