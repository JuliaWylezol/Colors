const colorDivs = document.querySelectorAll('.color');
const hexTexts = document.querySelectorAll('.colorHex');
const sliders = document.querySelectorAll('.sliders input');
const closeBtn = document.querySelectorAll('.sliders button');
const copyContainer = document.querySelector('.copy-container');
const saveContainer = document.querySelector('.save-container');
const saveBtn = document.querySelector('.save');
const libraryPopup = document.querySelector('.library-popup');
const saveInput = document.querySelector('.save-name');
const saveSubmit = document.querySelector('.submit-save');
const closeSave= document.querySelector('.close-save');
let savedPalettes = [];


let initialColors;
let palette;

sliders.forEach(slider => {
  slider.addEventListener('input', setColor);
  
});

colorDivs.forEach((div,index) => {
  div.addEventListener('change', () => {
    updateIcons(index);
  })
});

hexTexts.forEach(hex => {
  hex.addEventListener('click', () => {
    copyToClipboard(hex);
  });
}) ;

copyContainer.addEventListener('transitionend', () => {
  const popupBox = copyContainer.children[0];
  copyContainer.classList.remove('active');
  popupBox.classList.remove('active');
});



saveBtn.addEventListener('click', () => {
  saveContainer.classList.add('active');
});

saveSubmit.addEventListener('click', () => {
  addPalette(saveInput);
  saveContainer.classList.remove('active');
  saveInput.value = '';
});

closeSave.addEventListener('click', () => {
  saveContainer.classList.remove('active');
});

function generateHex() {
  let color = chroma.random();
  return color;
}


function randomColors() {
  initialColors = [];
  palette = [];
  colorDivs.forEach((div, index) => {
    let colorTittle = div.querySelector('.colorHex');
    let firstColor = generateHex();
    let hexText = chroma(firstColor).hex();
    initialColors.push(hexText);
    palette.push(hexText);
    let color = initialColors[index]
    div.style.backgroundColor = color ;
    colorTittle.innerHTML = hexText;
    let hue = div.querySelector('.hue-input');
    let bright = div.querySelector('.bright-input');
    let saturation = div.querySelector('.saturation-input');
    
    
    if(div.classList.length === 2) {
      let color = localStorage.getItem(`div${index}`);
      div.style.backgroundColor = color;
      colorTittle.innerText = color;
      initialColors[index] = color;
      palette[index] = color;
    }
    if(div.classList.length === 1) {
      colorizeSliders(hue, bright, saturation, color);
      checkLuminance(color, colorTittle);
      updateIcons(index);
    }
  });
  resetInputs();
  
}


function checkLuminance(color, div) {
  if(chroma(color).luminance() < 0.5) {
    div.style.color = 'white';
  } else {
    div.style.color = 'black'; 
  }
}

function colorizeSliders(hue, bright, saturation, color) {
  hue.style.background = `linear-gradient(to right, rgb(204,75,75), rgb(204,204,75), rgb(75,204,75), rgb(75,204,204), rgb(75,75,204), rgb(204,75,204), rgb(204,75,75))`;
  bright.style.background = `linear-gradient(to right, #000 , ${color}, #FFF)`;
  let noSat = chroma(color).set('hsl.s', 0)
  let fullSat = chroma(color).set('hsl.s', 1)
  saturation.style.background = `linear-gradient(to right, ${noSat}, ${color}, ${fullSat})`;
}

function setColor(e) {
  let index = 
  e.target.getAttribute('data-hue') ||
  e.target.getAttribute('data-bright') ||
  e.target.getAttribute('data-saturation');
 

  let sliders = e.target.parentElement.querySelectorAll("input[type='range']");
  const hue = sliders[0];
  const brightness = sliders[1];
  const saturation = sliders[2];

  const bgColor = initialColors[index];

  let color = chroma(bgColor)
  .set('hsl.s', saturation.value)
  .set('hsl.l', brightness.value)
  .set('hsl.h', hue.value)

  colorDivs[index].style.backgroundColor = color;
  palette[index] = color.hex();
  const hexText = colorDivs[index].children[0];
  hexText.innerHTML = color.hex();
  checkLuminance(color, hexText);
  colorizeSliders(hue, brightness, saturation, color);
};

function updateIcons(index) {
  const activeDiv = colorDivs[index];
  const color = chroma(activeDiv.style.backgroundColor);
  const icons = activeDiv.querySelectorAll('.controls button');

  for(icon of icons) {
    checkLuminance(color, icon);
  } 
  const adjustIcons = icons[0];
  // console.log(adjustIcons);
  adjustIcons.addEventListener('click', (e) => {
    let slider = e.target.parentElement.parentElement.children[2];
    slider.classList.add('active');
  });
  const openIcons = icons[1];
  const closeIcons = icons[2];
  const openIcon = document.getElementById(`open${index}`);
  const closeIcon = document.getElementById(`lock${index}`);

  openIcons.addEventListener('click', e => {
    let divColor = e.target.parentElement.parentElement;
    let index = divColor.getAttribute('data-index');
    divColor.classList.add('locked-div');
    openIcon.style.display = 'none';
    closeIcon.style.display = 'block';
    closeIcon.hidden= false;
    let hex = divColor.children[0].innerText;
    localStorage.setItem(`div${index}`, hex);
  });

  closeIcons.addEventListener('click', e => {
    let divColor = e.target.parentElement.parentElement;
    let index = divColor.getAttribute('data-index');
    divColor.classList.remove('locked-div');
      openIcon.style.display = 'block';
      closeIcon.style.display = 'none';
      closeIcon.hidden= true;
  });
  
};

closeBtn.forEach(btn => {
  btn.addEventListener('click', e => {
    e.target.parentElement.classList.remove('active');
  })
})

function resetInputs() {
  sliders.forEach(slider => {
    const colorDiv = slider.parentElement.parentElement;
    if(colorDiv.classList.length === 1) {
      if(slider.name === 'hue') {
        const hueColor = initialColors[slider.getAttribute('data-hue')];
        const hueValue = chroma(hueColor).hsl()[0];
        slider.value = Math.floor(hueValue);
      }
      if(slider.name === 'bright') {
        const brightColor = initialColors[slider.getAttribute('data-bright')];
        const brightValue = chroma(brightColor).hsl()[2];
        slider.value = Math.floor(brightValue * 100) / 100;
      }
       if(slider.name === 'saturation') {
        const saturationColor = initialColors[slider.getAttribute('data-saturation')];
        const saturationValue = chroma(saturationColor).hsl()[1];
        slider.value = Math.floor(saturationValue * 100) / 100;
      }
    }
  })
}

document.querySelector('.generate').addEventListener('click', randomColors)

function copyToClipboard(hex) {
  const el = document.createElement('textarea');
  el.value = hex.innerText;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  const popup = copyContainer.children[0];
  copyContainer.classList.add('active');
  popup.classList.add('active');
}


function addPalette(name) {
  let index = savedPalettes.length;
  let paletteContainer = document.createElement('div');
  let paletteName = document.createElement('h2');
  let colorsContainer = document.createElement('div');
  paletteName.classList.add('palette-name');
  colorsContainer.classList.add('colors-container');
  colorsContainer.dataset.numberOfContainer = index;
  libraryPopup.appendChild(paletteContainer);
  paletteContainer.appendChild(paletteName);
  paletteContainer.appendChild(colorsContainer);
  paletteName.innerText = name.value;
  paletteContainer.classList.add(`palette-container`);
  savedPalettes.push(Array.from(palette));
  palette.forEach(color => {
    let colorDiv = document.createElement('div');
    colorDiv.classList.add('palette-color');
    colorsContainer.appendChild(colorDiv);
    colorDiv.style.backgroundColor = color;
})
let selectPalette = document.createElement('button');
colorsContainer.appendChild(selectPalette);
selectPalette.classList.add('select-palette')
selectPalette.innerText = 'Select';

selectPalette.addEventListener('click', usePalette);
}

function usePalette(e) {
  colorDivs.forEach((div,index) => {
    let colorsContainer = e.target.parentElement;
    console.log(colorsContainer);
    let containerIndex = colorsContainer.getAttribute('data-number-of-container');
    console.log(savedPalettes);
    console.log(containerIndex);
    let paletteFromSaved = savedPalettes[containerIndex]
    console.log(paletteFromSaved);
    div.style.backgroundColor = paletteFromSaved[index];
    document.querySelector('.library-container').classList.remove('active');
  })
}

document.querySelector('.library').addEventListener('click', () => {
  document.querySelector('.library-container').classList.add('active');
})

document.querySelector('.close-library').addEventListener('click', () => {
  document.querySelector('.library-container').classList.remove('active');
})

randomColors();

