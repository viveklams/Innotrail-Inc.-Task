// script.js
document.addEventListener("DOMContentLoaded", () => {
  const table = document.getElementById("mainTable");
  const addRowButton = document.getElementById("addRow");
  const undoButton = document.getElementById("undo");
  const redoButton = document.getElementById("redo");

  let history = []; // stores  actions for undo/redo
  let historyIndex = -1; // tracks the current position in the history

  // initialize the table with 3 rows and 3 columns
  initializeTable(3, 3);

  // we are adding row button functionality
  addRowButton.addEventListener("click", () => {
    addRow();
    saveState();
  });

  // it will undo button functionality
  undoButton.addEventListener("click", () => {
    if (historyIndex > 0) {
      historyIndex--;
      restoreState(history[historyIndex]);
    }
  });

  // we will redo button functionality
  redoButton.addEventListener("click", () => {
    if (historyIndex < history.length - 1) {
      historyIndex++;
      restoreState(history[historyIndex]);
    }
  });

  // initialize the table with rows and columns
  function initializeTable(rows, cols) {
    for (let i = 0; i < rows; i++) {
      addRow();
    }
    saveState();
  }

  // adding  a new row to the table
  function addRow() {
    const row = document.createElement("tr");
    const cols = table.rows[0] ? table.rows[0].cells.length : 3;

    for (let j = 0; j < cols; j++) {
      const cell = document.createElement("td");
      const box = createBox();
      cell.appendChild(box);
      row.appendChild(cell);
    }

    table.appendChild(row);
    enableDragAndDrop();
  }

  // creating a draggable box with a unique number and color
  function createBox() {
    const box = document.createElement("div");
    box.className = "box";
    box.textContent = generateUniqueNumber();
    box.style.backgroundColor = generateUniqueColor();
    box.draggable = true;
    return box;
  }

  // generating a unique number for the box
  function generateUniqueNumber() {
    const boxes = document.querySelectorAll(".box");
    let maxNumber = 100;
    boxes.forEach((box) => {
      const number = parseInt(box.textContent);
      if (number > maxNumber) maxNumber = number;
    });
    return maxNumber + 100;
  }

  // generating  a unique color for the box
  function generateUniqueColor() {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  }

  // enabling drag-and-drop functionality
  function enableDragAndDrop() {
    const boxes = document.querySelectorAll(".box");
    boxes.forEach((box) => {
      box.addEventListener("dragstart", dragStart);
      box.addEventListener("dragend", dragEnd);
    });

    const cells = document.querySelectorAll("td");
    cells.forEach((cell) => {
      cell.addEventListener("dragover", dragOver);
      cell.addEventListener("drop", drop);
    });
  }

  // drag for to start event handler
  function dragStart(e) {
    e.dataTransfer.setData("text/plain", e.target.textContent);
    e.target.style.opacity = "0.4";
  }

  // drag to  end event handler
  function dragEnd(e) {
    e.target.style.opacity = "1";
  }

  // drag over event handler
  function dragOver(e) {
    e.preventDefault();
  }

  // Drop event handler
  function drop(e) {
    e.preventDefault();
    const sourceContent = e.dataTransfer.getData("text/plain");
    const sourceBox = findBoxByContent(sourceContent);
    const targetCell = e.target.closest("td");

    if (targetCell && sourceBox) {
      const targetBox = targetCell.querySelector(".box");
      if (targetBox) {
        // Swap boxes
        const tempContent = targetBox.textContent;
        const tempColor = targetBox.style.backgroundColor;

        targetBox.textContent = sourceBox.textContent;
        targetBox.style.backgroundColor = sourceBox.style.backgroundColor;

        sourceBox.textContent = tempContent;
        sourceBox.style.backgroundColor = tempColor;
      } else {
        // Move box to empty cell
        targetCell.appendChild(sourceBox);
      }
      saveState();
    }
  }

  // Find a box by its content
  function findBoxByContent(content) {
    const boxes = document.querySelectorAll(".box");
    for (const box of boxes) {
      if (box.textContent === content) return box;
    }
    return null;
  }

  // Save the current state of the table
  function saveState() {
    const state = [];
    const rows = table.querySelectorAll("tr");
    rows.forEach((row) => {
      const rowState = [];
      const cells = row.querySelectorAll("td");
      cells.forEach((cell) => {
        const box = cell.querySelector(".box");
        if (box) {
          rowState.push({
            content: box.textContent,
            color: box.style.backgroundColor,
          });
        } else {
          rowState.push(null);
        }
      });
      state.push(rowState);
    });

    // Clear redo history when a new action is performed
    history = history.slice(0, historyIndex + 1);
    history.push(state);
    historyIndex++;
  }

  // Restore the table to a previous state
  function restoreState(state) {
    table.innerHTML = "";
    state.forEach((rowState) => {
      const row = document.createElement("tr");
      rowState.forEach((cellState) => {
        const cell = document.createElement("td");
        if (cellState) {
          const box = createBox();
          box.textContent = cellState.content;
          box.style.backgroundColor = cellState.color;
          cell.appendChild(box);
        }
        row.appendChild(cell);
      });
      table.appendChild(row);
    });
    enableDragAndDrop();
  }
});
