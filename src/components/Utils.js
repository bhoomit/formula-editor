import _ from 'lodash'
export const setSelectionRange = (input, selectionStart, selectionEnd) => {
  if (input.setSelectionRange) {
    input.focus();
    input.setSelectionRange(selectionStart, selectionEnd);
  }
  else if (input.createTextRange) {
    var range = input.createTextRange();
    range.collapse(true);
    range.moveEnd('character', selectionEnd);
    range.moveStart('character', selectionStart);
    range.select();
  }
}

export const setCaretToPos = (input, pos) => {
  setSelectionRange(input, pos, pos)
}

export const trimStart = (string, trim) => {
  let arr = _.split(string, trim)
  return arr.length == 2?arr[1]:""
}