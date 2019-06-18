import React, { DragEvent, ChangeEvent, useState } from 'react';
import * as R from 'ramda';

/**
 * 1. There are files of format A and B
 *  1.1 Recognize them before read +
 *  1.2 Read a file +
 *  1.3 Keep file's info -
 *  1.4 Parse file's content (string) to data structure -
 * 2. With the successfully parsed files
 *  2.1 Operation on files -
 *  2.2 Operation on files' content -
 *  2.3 Drag component -
 */

// Dialogue
interface Dialogue {
  format: string;
  layer: string;
  start: string;
  end: string;
  style: string;
  name: string;
  marginL: string;
  marginR: string;
  marginV: string;
  effect: string;
  text: string;
}

// view to show a line.
function Line () {}

// operation on files.
export function Panel () {
  function loadFiles (files: FileList | null) {
    if (files) {
      const _files = Array.from(files);
    }
  }
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    loadFiles(e.target.files);
  }
  const handleDrop = (e: DragEvent) => {
    loadFiles(e.dataTransfer.files);
  }
  const preventDefault = (e: DragEvent) => {
    e.preventDefault();
  }
  return (
    <div className='captions'>
      <input className='dropEntry' onChange={handleChange} type="file" multiple/>
      <div className='dropArea' onDrop={handleDrop} onDragOver={preventDefault}></div>
      <div className='files'>
        <div className='files-time-axis'></div>
        <div className='files-captions'></div>
      </div>
    </div>
  );
}
