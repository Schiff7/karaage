import React, { DragEvent, ChangeEvent, useState } from 'react';
import * as R from 'ramda';

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

type Selected = boolean;

export function Captions () {
  const [captions, setCaptions] = useState([] as [File, Selected][]);
  const [timeAxises, setTimeAxises] = useState([] as [File, Selected][]);
  function loadFiles (files: FileList | null) {
    if (files) {
      const _files = Array.from(files);
      setCaptions(_files.filter(file => !/\.ass$/.test(file.name)).map(file => [file, false]));
      setTimeAxises(_files.filter(file => /\.ass$/.test(file.name)).map(file => [file, false]));
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
      <input className='entry' onChange={handleChange} type="file" multiple/>
      <div className='area' onDrop={handleDrop} onDragOver={preventDefault}></div>
      <div className='files'>
        <div className='files-time-axis'>
          <h3>time axis</h3>
          <ul>
            {timeAxises.map(([file, selected]) => 
              <li 
                className={selected ? 'selected': ''}
                onClick={() => setTimeAxises(timeAxises.map(([_file, selected]) => _file === file ? [_file, !selected] : [_file, selected]))} 
                key={file.name}
              >
                {file.name}
              </li>)}
          </ul>
        </div>
        <div className='files-captions'>
          <h3>caption</h3>
          <ul>
            {captions.map(([file, selected]) => 
              <li 
                className={selected ? 'selected': ''}
                onClick={() => setCaptions(captions.map(([_file, selected]) => _file === file ? [_file, !selected] : [_file, selected]))} 
                key={file.name}
              >
                {file.name}
              </li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}
