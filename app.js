const app = () => {
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    const burger = document.querySelector('.burger');
    const tool__board = document.querySelector('.tool__board');
    const option__button = document.querySelectorAll('.tool');
    let line__width = document.getElementById('brush__slider');
    let color__buttons = document.querySelectorAll('.colors .option');
    let colorPicker = document.querySelectorAll('.colors .colorPicker');
    clearCanvas = document.querySelector('.clear__button');
    saveCanvas = document.querySelector('.save__button');
    let prevMouseX, prevMouseY, snapshot;
    let painting = false;
    selectedTool = 'brush';
    selectedColor = '#000';
    const setCanvasBackground = () => {
        ctx.fillStyle = '#fff';
        ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle = selectedColor; // setting fill style back to the slected color, it'll be the brush color
    }
    burger.addEventListener('click', () => {
        tool__board.classList.toggle('active');
        burger.classList.toggle('active');
        // passing slider value as size of brush
    })
    line__width.addEventListener('change', (e) => {
        line__width = e.target.value;
    })
    const draw = (e) => {
        if(!painting) return;
        ctx.putImageData(snapshot, 0,0); // adding copeid canvas data on this canvas
        if(selectedTool === 'brush' || selectedTool === 'eraser'){
            // if selected tool is eraser then set strokeStyle to White
            // to paint white color on to existing canvas content else set stroke color to selected color
            ctx.strokeStyle = selectedTool === 'eraser' ? '#fff' : selectedColor;
            ctx.lineTo(e.offsetX, e.offsetY); //create a line according to the mouse pointer
            ctx.stroke(); // drawing line with color
        }
        else if(selectedTool === 'rectangle'){
            drawRect(e);
        }
        else if(selectedTool === 'triangle'){
            drawTriangle(e);
        }
        else if(selectedTool === 'circle'){
            drawCircle(e);
        }
        
    
    }

    const drawRect = (e) => {
        // if fill color is not checked draw a rect with border
        if(!fillColor.checked){
            return ctx.strokeRect(e.offsetX, e.offsetY, 
                prevMouseX - e.offsetX, 
                prevMouseY - e.offsetY);
            }
            // draw a rect with background
            ctx.fillRect(e.offsetX, e.offsetY, 
                prevMouseX - e.offsetX, 
                prevMouseY - e.offsetY);
    }
    const drawCircle = (e) => {
        ctx.beginPath();
        // getting radius for circle according to the mouse pointer
        let radius = Math.sqrt(Math.pow((prevMouseX - e.offsetX),2) + Math.pow((prevMouseY - e.offsetY),2)) 
        ctx.arc(prevMouseX, prevMouseY, radius, 0, Math.PI*2);
        // if fillcolor checked fill a circle else draw a border circle
        fillColor.checked ? ctx.fill() : ctx.stroke();
    }
    const drawTriangle = (e) => {
        ctx.beginPath(); // create a new path
        ctx.moveTo(prevMouseX, prevMouseY); // moving triangle to the mouse pointer
        ctx.lineTo(e.offsetX, e.offsetY); // creating first line according to the mouse pointer
        ctx.lineTo(prevMouseX * 2 - e.offsetX, e.offsetY);  // creating bottom line of triangle
        ctx.closePath(); // closing path of a triangle so the third line draw automatically
        fillColor.checked ? ctx.fill() : ctx.stroke(); // if fillcolor checked fill a triangle else draw a border triangle
    
    }
    const startPosition = (e) => {
        painting = true;
        prevMouseX = e.offsetX; //passing current mouse X position as prevMouseX value
        prevMouseY = e.offsetY; //passing current mouse Y position as prevMouseY value
        ctx.beginPath(); // create a new path to draw
        ctx.lineWidth = line__width; // passing the size of brush
        ctx.strokeStyle = selectedColor; // passing selected color as stroke color
        ctx.fillStyle = selectedColor; // passing selected color as fill color
        // coping canvas data & passing as snapshot value to avoids dragging the image
        snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    }
    const finishedPsition = () => {
        painting = false;
        ctx.beginPath();
    }

    option__button.forEach(tool => {
        tool.addEventListener('click', () => {
            document.querySelector('.options .active').classList.remove('active');
            tool.classList.add('active')
            selectedTool = tool.id; 
        })
    })
    color__buttons.forEach(btn => {
        btn.addEventListener('click', () => { // add click event to all color button
            // removing selected color class from the option and add to current selected color
            document.querySelector('.options .selected__color').classList.remove('selected__color');
            btn.classList.add('selected__color')
            // passing selected button background color as selected color value
            selectedColor = window.getComputedStyle(btn).getPropertyValue('background-color');
        })
    })
    colorPicker.forEach(color => {
        color.addEventListener('change', () => {
            // passing picked color value from color picker to last color btn background
            color.parentElement.style.backgroundColor = color.value;
            color.parentElement.click();
    })
    })
    clearCanvas.addEventListener('click', () => {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        setCanvasBackground();
    })
    saveCanvas.addEventListener('click', () => {
        const link = document.createElement("a"); // creating an a tag
        link.download = `${new Image()}.jpg`; // passing current Image object as link dowmload value
        link.href = canvas.toDataURL(); // passing canvas Image data as link href value
        link.click(); // clicking link to download image
    })

    canvas.addEventListener('mousedown', startPosition)
    canvas.addEventListener('mouseup', finishedPsition)
    canvas.addEventListener('mousemove', draw)
    window.addEventListener('load', () => {
        // setting canvas width and height returns viewable width and height of an element
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        setCanvasBackground();
    })
    window.addEventListener('resize', () => {
        // makes canvas responsive
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    })
}
app();
