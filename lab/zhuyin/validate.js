import {lockedSourceText} from './fixture.js';
export function verifyItems(rows,source=lockedSourceText){
 const errors=[];
 if(!Array.isArray(rows)||rows.length!==source.length)return {ok:false,passed:0,errors:['題數不符']};
 rows.forEach((row,i)=>{
  const expected=source[i],actual=`${row.prompt}：${row.answer}`;
  if(row.id!==i+1||row.lockedSourceText!==expected||actual!==expected){
   const a=Array.from(actual),e=Array.from(expected);let position=0;while(position<Math.max(a.length,e.length)&&a[position]===e[position])position++;
   errors.push(`第 ${i+1} 題第 ${position+1} 字元不符`);
  }
 });
 return {ok:errors.length===0,passed:rows.length-errors.length,errors};
}
export function verifyRendered(lines,source=lockedSourceText){return lines.length===source.length&&lines.every((line,i)=>line===source[i])}
