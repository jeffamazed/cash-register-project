const changeDueContainer = document.getElementById("change-due");
const cashInput = document.getElementById("cash");
const purchaseBtn = document.getElementById("purchase-btn");
const totalPriceSpan = document.getElementById("total-price");
const enterBtn = document.getElementById("enter-btn");
const cashUnitsSpan = document.querySelectorAll(".cash-unit");
const buttonSound = new Audio("./audio/button-press-final.mp3");
const purchaseSound = new Audio("./audio/kaching-final.mp3");


let price = 1.87;
let cid = [
  ["PENNY", 1.01],
  ["NICKEL", 2.05],
  ["DIME", 3.1],
  ["QUARTER", 4.25],
  ["ONE", 90],
  ["FIVE", 55],
  ["TEN", 20],
  ["TWENTY", 60],
  ["ONE HUNDRED", 100]
];


// Interface

totalPriceSpan.textContent = price;
cashUnitsSpan.forEach((unit, i) => {
  unit.textContent = cid[i][1];
});

const updateCashUnitsSpan = (cid) => {
  cashUnitsSpan.forEach((unit, i) => {
  unit.textContent = cid[i][1];
  });
};

// Logic and Functions

const fixFloats = val => Math.round(val * 100) / 100;

const resetState = () => {
  changeDueContainer.innerHTML = "";
  cashInput.value = "";
};

const checkCashRegister = (price, cash, cid) => {
  const cashUnits = [
    { name: "ONE HUNDRED", value: 100 },
    { name: "TWENTY", value: 20 },
    { name: "TEN", value: 10 },
    { name: "FIVE", value: 5 },
    { name: "ONE", value: 1 },
    { name: "QUARTER", value: 0.25 },
    { name: "DIME", value: 0.1 },
    { name: "NICKEL", value: 0.05 },
    { name: "PENNY", value: 0.01 }
  ];
  
  const cidMap = Object.fromEntries(cid);
  cashUnits.forEach(unit => {
    unit.total = cidMap[unit.name];
  });
    
  let changeDue = fixFloats(cash - price);
  const totalCid = fixFloats(cashUnits.reduce((sum, curr) => sum + curr.total, 0));

  if (changeDue === totalCid) {
    return {
      status: "CLOSED",
      change: cid.filter(([_, amount]) => amount > 0)
    };
  }

  const changeArray = [];
  
  cashUnits.forEach(unit => {
    let amountToReturn = 0;

    while (changeDue >= unit.value && unit.total > 0) {
      changeDue = fixFloats(changeDue - unit.value);
      unit.total = fixFloats(unit.total - unit.value);
      amountToReturn += fixFloats(unit.value);
    }

    if (amountToReturn > 0) {
      amountToReturn = fixFloats(amountToReturn);
      changeArray.push([unit.name, amountToReturn]);
    }
  });

  for (let i = 0; i < cid.length; i++) {
    const unit = cashUnits.find(u => u.name === cid[i][0]);
    cid[i][1] = fixFloats(unit.total);
  }

  let result;
  if (changeDue > 0) {
    result = {
      status: "INSUFFICIENT_FUNDS",
      change: []
    };
  } else {
    result = {
      status: "OPEN",
      change: changeArray
    };
  }
  return result;
}

const updateInterface = (cashAmount) => {
  const resultObj = checkCashRegister(price, cashAmount, cid);
  
  const statusP = document.createElement("p");
  statusP.textContent = `Status: ${resultObj.status}`;

  changeDueContainer.appendChild(statusP);

  resultObj.change.forEach(([name, amount]) => {
    const changeP = document.createElement("p");
    changeP.textContent = `${name}: $${amount}`;
    
    changeDueContainer.appendChild(changeP);
  });
};

// Interactivity

purchaseBtn.addEventListener("click", () => {
  purchaseSound.play();
  resetState();
  const cashAmount = parseFloat(cashInput.value);
  if (price > cashAmount) {
    alert("Customer does not have enough money to purchase the item");
    return;
  } else if (price === cashAmount) {
    changeDueContainer.textContent = "No change due - customer paid with exact cash";
  } else {
    updateInterface(cashAmount);
    updateCashUnitsSpan(cid);
  }
});



cashInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    purchaseBtn.click();
  }
});

const insertNum = num => {
  cashInput.value += num;
  buttonSound.play();
};

const clearInput = () => {
  cashInput.value = "";
  buttonSound.play();
};

enterBtn.addEventListener("click", () => {
  purchaseSound.play();
  purchaseBtn.click();
});

// FOR LOGO

const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
const colors = ["#00BFFF", "#FF4136", "#2ECC40", "#FFDC00"];


canvas.width = 50;
canvas.height = 50;

function proportionalSize(size) {
  return size * canvas.width / 500;
}

function rotateAxis({ x, y }, angle) {
  return {
    x: x * Math.cos(angle) - y * Math.sin(angle),
    y: x * Math.sin(angle) + y * Math.cos(angle)
  };
}

class Particle {
  constructor({ position, radius, color, radians, distFromCenter, angle }) {
    this.position = position;
    this.radius = radius;
    this.color = color;
    this.velocity = 0.15;
    this.radians = radians;
    this.center = { ...position };
    this.distFromCenter = distFromCenter;
    this.angle = angle;
  }

  update() {
    const lastPoint = { ...this.position };

    this.radians += this.velocity;

    const x = Math.cos(this.radians) * this.distFromCenter.x;
    const y = Math.sin(this.radians) * this.distFromCenter.y;

    const rotatedXAndY = rotateAxis({ x, y }, this.angle)
    this.position.x = this.center.x + rotatedXAndY.x;
    this.position.y = this.center.y + rotatedXAndY.y;

    this.draw(lastPoint);
  }

  draw(lastPoint) {
    c.beginPath();
    c.strokeStyle = this.color;
    c.lineWidth = this.radius;
    c.moveTo(lastPoint.x, lastPoint.y);
    c.lineTo(this.position.x, this.position.y);
    c.lineCap = "round";
    c.stroke();
    c.closePath();
  }
}

let particles;
function init() {
  particles = [];
  
  const particleCount = 4;
  const angleIncrement = Math.PI / particleCount;
  const distFromCenter = {
    x: 180,
    y: 15
  };
  for (let i = 0; i < particleCount; i++) {
    const particleColor = colors [i];
    particles.push(
      new Particle({
        position: {
          x: canvas.width / 2,
          y: canvas.height / 2
        },
        radius: proportionalSize(25),
        color: particleColor,
        radians: angleIncrement * i,
        distFromCenter: {
          x: proportionalSize(distFromCenter.x),
          y: proportionalSize(distFromCenter.y)
        },
        angle: angleIncrement * i
      })
    );
  }
}

function animate() {
  window.requestAnimationFrame(animate);
  //change based on background
  c.fillStyle = "rgba(13, 11, 31, 0.05)"; 
  c.fillRect(0, 0, canvas.width, canvas.height);

  particles.forEach(particle => particle.update());
}

init();
animate();
