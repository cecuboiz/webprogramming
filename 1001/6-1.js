<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>자바스크립트 코드</title>
   <script src="practice6-1-2.js"></script>
</head>
<body>
    <h3>마우스를 올려 보세요</h3>
    <hr>
    <div  onmouseover="over(this)"
onmouseout="out(this)" >
여기에 마우스를 올리면 배경색이 노란색으로 변합니다. </div>
    
</body>
</html>
     function over(obj){
            obj.style.background="yellow";
        }
        function out(obj) {
            obj.style.background="white";
        }