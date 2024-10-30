const canvas = document.getElementById('materialCanvas');
const ctx = canvas.getContext('2d');

// 材料の初期設定
let materialWidth = 600; // 横600mm
let materialHeight = 150; // 縦150mm
let gapHeight = 0; //下0㎜
let gapWidth = 5; //右5㎜
let currentX = 0;
let currentY = 0;
let parts = []; // 部品を管理する配列
let partCounter = 1; // 部品名に使うカウンター

// キャンバス初期化
canvas.width = materialWidth;
canvas.height = materialHeight;

// 初期描画
drawMaterial();

// 材料を描画し、背景色を設定
function drawMaterial() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#f0e68c"; // 材料の色
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeRect(0, 0, canvas.width, canvas.height);
}

// 入力値で材料サイズを更新
function setMaterial() {
  materialHeight = parseInt(document.getElementById('materialHeight').value);
  materialWidth = parseInt(document.getElementById('materialWidth').value);

  canvas.width = materialWidth;
  canvas.height = materialHeight;

  currentX = 0;
  currentY = 0;
  parts = [];
  partCounter = 1;

  drawMaterial(); // 材料を再描画
  updatePartList();
  updateRemainingDimensions();
}

// 部品の合計サイズを計算
function updateRemainingDimensions() {
  let totalPartWidth = 0;
  let totalPartHeight = 0;
  let totalGapWidth = 0;
  let totalGapHeight = 0;

  parts.forEach(part => {
    totalPartWidth += part.width;
    totalPartHeight += part.height;
    totalGapWidth += part.gapWidth;
    totalGapHeight += part.gapHeight;
  });

  const remainingWidth = materialWidth - (totalPartWidth + totalGapWidth);
  const remainingHeight = materialHeight - (totalPartHeight + totalGapHeight);

  document.getElementById('remainingWidth').textContent = remainingWidth;
  document.getElementById('remainingHeight').textContent = remainingHeight;
}

// 部品リストを更新し、合計値を表示
function updatePartList() {
  const partList = document.getElementById('partList');
  
  // テーブルの行をクリアしてから更新
  partList.innerHTML = `
    <tr>
      <th>部品名</th>
      <th>縦 (mm)</th>
      <th>縦隙間 (mm)</th>
      <th>横 (mm)</th>
      <th>横隙間 (mm)</th>
      <th>削除</th>
      <th>寸法変更</th>
    </tr>
  `;

  let totalHeight = 0; // 縦の合計
  let totalGapHeight = 0; // 縦隙間の合計
  let totalWidth = 0; // 横の合計
  let totalGapWidth = 0; // 横隙間の合計

  parts.forEach((part, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${part.name}</td>
      <td>${part.height}</td>
      <td>${part.gapHeight}</td> <!-- 縦隙間（下隙間） -->
      <td>${part.width}</td>
      <td>${part.gapWidth}</td> <!-- 横隙間（右隙間） -->
      <td><button onclick="deletePart(${index})">削除</button></td>
      <td><button onclick="editPart(${index})">寸法変更</button></td>
    `;
    partList.appendChild(row);

    // 合計値の計算
    totalHeight += part.height;
    totalGapHeight += part.gapHeight;
    totalWidth += part.width;
    totalGapWidth += part.gapWidth;
  });

  // 合計値行を追加
  const totalRow = document.createElement('tr');
  totalRow.innerHTML = `
    <td><strong>合計</strong></td>
    <td><strong>${totalHeight}</strong></td>
    <td><strong>${totalGapHeight}</strong></td>
    <td><strong>${totalWidth}</strong></td>
    <td><strong>${totalGapWidth}</strong></td>
    <td colspan="2"></td> <!-- 削除と寸法変更の列は空白 -->
  `;
  partList.appendChild(totalRow);
}


// 部品の再描画
function redrawParts() {
  drawMaterial();  // 材料を再描画
  currentX = 0;    // 配置位置のX座標をリセット
  currentY = 0;    // 配置位置のY座標をリセット
  const direction = document.querySelector('input[name="direction"]:checked').value; // 「右」か「下」の選択

  parts.forEach(part => {
    // 追加方向に応じて位置を調整
    if (direction === 'right') {
      if (currentX + part.width > materialWidth) {
        currentX = 0;
        currentY += part.height + part.gapHeight; // 次の行に移動
      }
    } else if (direction === 'down') {
      if (currentY + part.height > materialHeight) {
        currentY = 0;
        currentX += part.width + part.gapWidth; // 次の列に移動
      }
    }

    // 部品を描画
    ctx.fillStyle = part.color;
    ctx.fillRect(currentX, currentY, part.width, part.height);

    // 隙間の色を黒に設定して描画
    ctx.fillStyle = "black";
    if (direction === 'right') {
      // 右隙間を描画
      ctx.fillRect(currentX + part.width, currentY, part.gapWidth, part.height);
    } else if (direction === 'down') {
      // 横隙間を描画
      ctx.fillRect(currentX, currentY + part.height, part.width, part.gapHeight);
    }

    // 次の位置を更新
    if (direction === 'right') {
      currentX += part.width + part.gapWidth;
    } else if (direction === 'down') {
      currentY += part.height + part.gapHeight;
    }
  });

  updateRemainingDimensions();
}


// 色をランダムに生成
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// 全部の部品をクリア
function clearAllParts() {
  parts = [];
  currentX = 0;
  currentY = 0;
  partCounter = 1;

  drawMaterial();
  updatePartList();
  updateRemainingDimensions();
}

//部品を削除した後、再配置する
function deletePart(index) {
  parts.splice(index, 1);  // 指定したインデックスの部品を削除
  currentX = 0;            // 配置位置のX座標をリセット
  currentY = 0;            // 配置位置のY座標をリセット

// 隙間の色を黒に設定
  ctx.fillStyle = "black";

  redrawParts();           // 部品を再描画
  updatePartList();        // 部品リストを更新
  updateRemainingDimensions(); // 残り寸法を更新
}

// 部品の寸法を変更する
function editPart(index) {
  const newHeight = prompt("新しい縦の寸法を入力してください:", parts[index].height);
  const newWidth = prompt("新しい横の寸法を入力してください:", parts[index].width);
  const newGapWidth = prompt("新しい横隙間を入力してください:", parts[index].gapWidth);
  const newGapHeight = prompt("新しい縦隙間を入力してください:", parts[index].gapHeight);

  if (newHeight && newWidth && newGapWidth && newGapHeight) {
    parts[index].height = parseInt(newHeight);
    parts[index].width = parseInt(newWidth);
    parts[index].gapWidth = parseInt(newGapWidth);
    parts[index].gapHeight = parseInt(newGapHeight);

// 隙間の色を黒に設定
  ctx.fillStyle = "black";
    
    redrawParts();
    updatePartList();
    updateRemainingDimensions();
  }
}

// 部品を追加
// 部品を追加
function addNextPart() {
  const partHeight = parseInt(document.getElementById('partHeight').value);
  const partWidth = parseInt(document.getElementById('partWidth').value);
  const gapWidth = parseInt(document.getElementById('gapWidth').value) || 0; // 右の隙間
  const gapHeight = parseInt(document.getElementById('gapHeight').value) || 0; // 下の隙間
  const direction = document.querySelector('input[name="direction"]:checked').value;
  const partColor = getRandomColor();

  // 新しい位置を計算
  let newX = currentX;
  let newY = currentY;

  // 部品の追加位置を決定
  if (direction === 'right') { // 右に追加のとき
    newX += partWidth + gapWidth; // 次の部品のX座標を計算
    if (newX <= materialWidth) {
      const newPart = {
        name: `部品${partCounter++}`,
        x: currentX,
        y: currentY,
        height: partHeight,
        width: partWidth,
        color: partColor,
        gapWidth: gapWidth,
        gapHeight: gapHeight
      };
      parts.push(newPart);
      currentX = newX; // 次の部品のX座標を更新
    } else {
      alert("これ以上右に部品を追加できません。");
      return;
    }
  } else if (direction === 'down') { // 下に追加
    newY += partHeight + gapHeight; // 次の部品のY座標を計算
    if (newY <= materialHeight) {
      const newPart = {
        name: `部品${partCounter++}`,
        x: currentX,
        y: currentY,
        height: partHeight,
        width: partWidth,
        color: partColor,
        gapWidth: gapWidth,
        gapHeight: gapHeight
      };
      parts.push(newPart);
      currentY = newY; // 次の部品のY座標を更新
    } else {
      alert("これ以上下に部品を追加できません。");
      return;
    }
  }

  // 隙間の色は常に黒
  const gapColor = "black";

  // 隙間と部品を描画
  redrawParts(gapColor);
  updatePartList();
  updateRemainingDimensions();
}

// 部品の再描画
function redrawParts(gapColor) {
  drawMaterial();  // 材料を再描画
  currentX = 0;    // 配置位置のX座標をリセット
  currentY = 0;    // 配置位置のY座標をリセット
  const direction = document.querySelector('input[name="direction"]:checked').value; // 「右」か「下」の選択

  parts.forEach(part => {
    // 追加方向に応じて位置を調整
    if (direction === 'right') {
      if (currentX + part.width > materialWidth) {
        currentX = 0;
        currentY += part.height + part.gapHeight; // 次の行に移動
      }
    } else if (direction === 'down') {
      if (currentY + part.height > materialHeight) {
        currentY = 0;
        currentX += part.width + part.gapWidth; // 次の列に移動
      }
    }

    // 部品を描画
    ctx.fillStyle = part.color;
    ctx.fillRect(currentX, currentY, part.width, part.height);

    // 横隙間を描画
    if (part.gapWidth >= 0) {
      ctx.fillStyle = gapColor; // 隙間の色を黒に設定
      ctx.fillRect(currentX + part.width, currentY, part.gapWidth, part.height);
    }

    // 縦隙間を描画
    if (part.gapHeight >= 0) {
      ctx.fillStyle = gapColor; // 隙間の色を黒に設定
      ctx.fillRect(currentX, currentY + part.height, part.width, part.gapHeight);
    }

    // 次の位置を更新
    if (direction === 'right') {
      currentX += part.width + part.gapWidth;
    } else if (direction === 'down') {
      currentY += part.height + part.gapHeight;
    }
  });

  updateRemainingDimensions();
}
