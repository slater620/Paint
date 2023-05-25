var spSketchImg;
var spRefereneImg;
var spResultImg;
var spColorImg;
var spHintNode;
var spBTN;
var spLAB;

var fileInputForSketch;
var fileInputForReferene;

var mousePosition;
var mouseInReference = false;

var loaded = false;

var getMouseDown = false;
var preMouseInRef = false;
var selectingColor = false;
var painting = false;
var finalX = 0;
var finalY = 0;

var hasSketch = false;
var hasRef = false;

var HTML_Canvas_sketch;
var HTML_Canvas_reference;
var HTML_Canvas_hint;

var isPen = true;

var mouseIsDown = false;

var sketchID = "new";
var referenceID = "new";
var tempID;

var resultURL = "";

var method = "colorize"; // colorize/render/transfer
var sketchDenoise = "true" // true/false
var resultDenoise = "true" // true/false
var algrithom = "quality" // quality/stability

var version = 2;

var denoiseV = 0;

var view_node;

var temp_btn_str;

var sketch_w = 10;
var sketch_h = 10;

var white_result;

var spQuickBTN;
var spWaiting;

function createObjectURL(blob) {
    if (window.URL !== undefined)
        return window['URL']['createObjectURL'](blob);
    else
        return window['webkitURL']['createObjectURL'](blob);
}

function onSketchFileSelected(evt) {
    loadLocalSketch(createObjectURL(evt.target.files[0]));
}

function onRefereneFileSelected(evt) {
    loadLocalReference(createObjectURL(evt.target.files[0]));
}

function loadLocalReference(uri) {
    var tempDiv = document.getElementById("tempDivReference");
    if (tempDiv === null) {
        var tempDiv = document.createElement("div");
        document.body.appendChild(tempDiv);
        tempDiv.style.position = "absolute";
        tempDiv.id = "tempDivReference";
        tempDiv.innerHTML = '<img id=imgheadReference>';
        tempDiv.style.display = 'none';
        tempDiv.style.visibility = "hidden";
    }
    var img = document.getElementById('imgheadReference');
    img.onload = function () {

        var w_224 = parseFloat(this.width);
        var h_224 = parseFloat(this.height);
        if (w_224 > h_224) {
            w_224 = 224.0 / h_224 * w_224;
            h_224 = 224.0;
        }
        else {
            h_224 = 224.0 / w_224 * h_224;
            w_224 = 224.0;
        }

        var w_380 = parseFloat(this.width);
        var h_380 = parseFloat(this.height);
        if (w_380 < h_380) {
            w_380 = 380.0 / h_380 * w_380;
            h_380 = 380.0;
        }
        else {
            h_380 = 380.0 / w_380 * h_380;
            w_380 = 380.0;
        }

        spRefereneImg.node.width = parseInt(w_380);
        spRefereneImg.node.height = parseInt(h_380);
        HTML_Canvas_reference.width = parseInt(w_224);
        HTML_Canvas_reference.height = parseInt(h_224);

        HTML_Canvas_reference.getContext("2d").drawImage(this, 0, 0, HTML_Canvas_reference.width, HTML_Canvas_reference.height);
        HTML_Canvas_hint.getContext("2d").clearRect(0, 0, HTML_Canvas_hint.width, HTML_Canvas_hint.height);

        var referenceNodeTexture = spRefereneImg.spriteFrame.getTexture();
        var hintNodeTexture = spHintNode.getComponent('cc.Sprite').spriteFrame.getTexture();

        hintNodeTexture.initWithElement(HTML_Canvas_hint);
        hintNodeTexture.handleLoadedTexture();

        referenceNodeTexture.initWithElement(HTML_Canvas_reference);
        referenceNodeTexture.handleLoadedTexture();

        var tempCanvas_200 = document.createElement("canvas");
        tempCanvas_200.width = parseInt(w_380);
        tempCanvas_200.height = parseInt(h_380);
        tempCanvas_200.getContext("2d").drawImage(this, 0, 0, tempCanvas_200.width, tempCanvas_200.height);
        referenceNodeTexture._pixels = tempCanvas_200.getContext("2d").getImageData(0, 0, tempCanvas_200.width, tempCanvas_200.height).data;

        hasRef = true;
        referenceID = "new";
    }
    img.src = uri;
}

var resultTexture = null;

function loadLocalResult(uri) {
    tempID = uri.split("*");
    if (tempID.length == 2) {
        resultURL = "results/" + tempID[0] + ".jpg?t=" + Math.random().toString();
        resultTexture = cc.textureCache.addImage(resultURL);
    }
}

function loadLocalSketch(uri) {
    var tempDiv = document.getElementById("tempDivSketch");
    if (tempDiv === null) {
        var tempDiv = document.createElement("div");
        document.body.appendChild(tempDiv);
        tempDiv.style.position = "absolute";
        tempDiv.id = "tempDivSketch";
        tempDiv.innerHTML = '<img id=imgheadSketch>';
        tempDiv.style.display = 'none';
        tempDiv.style.visibility = "hidden";
    }
    var img = document.getElementById('imgheadSketch');
    img.onload = function () {

        var w = parseFloat(this.width);
        var h = parseFloat(this.height);

        if (h < w) {
            if (h > 1024) {
                w = 1024.0 / h * w;
                h = 1024.0;
            }
        } else {
            if (w > 1024) {
                h = 1024.0 / w * h;
                w = 1024.0;
            }
        }

        HTML_Canvas_sketch.width = parseInt(w);
        HTML_Canvas_sketch.height = parseInt(h);

        if (w > h) {
            w = 512.0 / h * w;
            h = 512.0;
        }
        else {
            h = 512.0 / w * h;
            w = 512.0;
        }

        HTML_Canvas_hint.width = parseInt(w);
        HTML_Canvas_hint.height = parseInt(h);

        sketch_w = parseFloat(this.width);
        sketch_h = parseFloat(this.height);

        HTML_Canvas_sketch.getContext("2d").drawImage(this, 0, 0, HTML_Canvas_sketch.width, HTML_Canvas_sketch.height);
        HTML_Canvas_hint.getContext("2d").clearRect(0, 0, HTML_Canvas_hint.width, HTML_Canvas_hint.height);

        var hintNodeTexture = spHintNode.getComponent('cc.Sprite').spriteFrame.getTexture();
        hintNodeTexture.initWithElement(HTML_Canvas_hint);
        hintNodeTexture.handleLoadedTexture();

        var sketchNodeTexture = spSketchImg.spriteFrame.getTexture();
        sketchNodeTexture.initWithElement(HTML_Canvas_sketch);
        sketchNodeTexture.handleLoadedTexture();

        hasSketch = true;
        sketchID = "new";
        referenceID = "new";
        spResultImg.spriteFrame.setTexture(white_result);

        spQuickBTN.opacity = 255;
    }
    img.src = uri;
}

cc.Texture2D.prototype._pixels = [];
cc.Texture2D.prototype.getPixels = function (x, y, newWidth, newHeight) {
    var idx = parseInt((newHeight - parseInt(y)) * newWidth * 4 + parseInt(x) * 4);
    return new cc.color(this._pixels[idx], this._pixels[idx + 1], this._pixels[idx + 2]);
};

cc.Class({
    extends: cc.Component,

    properties: {
        sketchImg: {
            default: null, type: cc.Node
        },
        referenceImg: {
            default: null, type: cc.Node
        },
        resultImg: {
            default: null, type: cc.Node
        },
        colorImg: {
            default: null, type: cc.Node
        },
        flag: {
            default: null, type: cc.Node
        },
        hint: {
            default: null, type: cc.Node
        },
        btn: {
            default: null, type: cc.Node
        },
        view: {
            default: null, type: cc.Node
        },
        quickBTN: {
            default: null, type: cc.Node
        },
        waiting: {
            default: null, type: cc.Node
        },
        loading: {
            default: "", type: cc.String
        },
    },

    onQualityFirst: function () {
        algrithom = "quality";
    },

    onStabilityFirst: function () {
        algrithom = "stability";
    },

    onOpColorize: function () {
        method = "colorize";
    },

    onOpRender: function () {
        method = "render";
    },

    onOpTransfer: function () {
        method = "transfer";
    },

    onSketchDenoising: function (toggle, customEventData) {
        if (toggle.isChecked) {
            sketchDenoise = "true";
        } else {
            sketchDenoise = "false";
        }
    },

    onResultDenoising: function (toggle, customEventData) {
        if (toggle.isChecked) {
            resultDenoise = "true";
        } else {
            resultDenoise = "false";
        }
    },

    onLoad: function () {

        cc.director.setClearColor(cc.color(0, 0, 0, 0))

        spSketchImg = this.sketchImg.getComponent('cc.Sprite');
        spRefereneImg = this.referenceImg.getComponent('cc.Sprite');
        spResultImg = this.resultImg.getComponent('cc.Sprite');
        spColorImg = this.colorImg.getComponent('cc.Sprite');
        spHintNode = this.hint;
        view_node = this.view;
        spBTN = this.btn.getComponent('cc.Button');
        spLAB = this.btn.getComponent('cc.RichText');

        white_result = spResultImg.spriteFrame.getTexture();

        fileInputForSketch = document.createElement("input");
        fileInputForSketch.id = "fileInputForSketch";
        fileInputForSketch.type = "file";
        fileInputForSketch.accept = "image/*";
        fileInputForSketch.style.height = "0px";
        fileInputForSketch.style.display = "block";
        fileInputForSketch.style.overflow = "hidden";
        document.body.insertBefore(fileInputForSketch, document.body.firstChild);
        fileInputForSketch.addEventListener('change', onSketchFileSelected, false);

        fileInputForReferene = document.createElement("input");
        fileInputForReferene.id = "fileInputForReferene";
        fileInputForReferene.type = "file";
        fileInputForReferene.accept = "image/*";
        fileInputForReferene.style.height = "0px";
        fileInputForReferene.style.display = "block";
        fileInputForReferene.style.overflow = "hidden";
        document.body.insertBefore(fileInputForReferene, document.body.firstChild);
        fileInputForReferene.addEventListener('change', onRefereneFileSelected, false);

        this.node.on("mousemove", function (event) {
            mousePosition = event.getLocation();
        });

        this.node.on("mousedown", function (event) {
            mouseIsDown = true;
        });

        this.node.on("mouseup", function (event) {
            getMouseDown = true;
            mouseIsDown = false;
        });

        HTML_Canvas_hint = document.createElement("canvas");
        HTML_Canvas_hint.id = "HTML_Canvas_hint";

        HTML_Canvas_reference = document.createElement("canvas");
        HTML_Canvas_reference.id = "HTML_Canvas_reference";

        HTML_Canvas_sketch = document.createElement("canvas");
        HTML_Canvas_sketch.id = "HTML_Canvas_sketch";

        spQuickBTN = this.quickBTN;
        spWaiting = this.waiting;

        this.quickBTN.opacity = 0;
        this.waiting.opacity = 0;

        loaded = true;

    },

    onSketchClicked: function () {
        fileInputForSketch.click();
    },
    onRefenceClicked: function () {
        fileInputForReferene.click();
    },
    onPenClicked: function () {
        isPen = true;
    },
    onEraserClicked: function () {
        isPen = false;
    },
    onClearClicked: function () {
        var cxt = HTML_Canvas_hint.getContext("2d");
        cxt.clearRect(0, 0, HTML_Canvas_hint.width, HTML_Canvas_hint.height);
        var hintNodeTex = spHintNode.getComponent('cc.Sprite').spriteFrame.getTexture();
        hintNodeTex.initWithElement(HTML_Canvas_hint);
        hintNodeTex.handleLoadedTexture();
    },
    onColorizeClicked: function () {
        if (!hasRef) {
            return;
        }
        if (!hasSketch) {
            return;
        }

        this.waiting.opacity = 255;
        this.quickBTN.opacity = 0;

        var hintDataURL = HTML_Canvas_hint.toDataURL("image/png");
        var referenceDataURL = HTML_Canvas_reference.toDataURL("image/png");
        var sketchDataURL = HTML_Canvas_sketch.toDataURL("image/png");

        var xhr = new XMLHttpRequest();
        xhr.open("POST", "/paint", true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;");
        xhr.onreadystatechange = function () {
            loadLocalResult(xhr.responseText);
        };
        if (sketchID != "new") {
            sketchDataURL = "null";
        }
        if (referenceID != "new") {
            referenceDataURL = "null";
        }
        xhr.send
            (
            "sketch=" + encodeURIComponent(sketchDataURL) +
            "&reference=" + encodeURIComponent(referenceDataURL) +
            "&hint=" + encodeURIComponent(hintDataURL) +
            "&sketchDenoise=" + sketchDenoise +
            "&resultDenoise=" + resultDenoise +
            "&algrithom=" + algrithom +
            "&method=" + method +
            "&sketchID=" + sketchID +
            "&referenceID=" + referenceID
            );
        spBTN.enabled = false;
        resultTexture = null;
        temp_btn_str = spLAB.string;
        spLAB.string = this.loading;
    },
    onDownloadClicked: function () {
        if (resultURL == "") {
            return;
        }
        window.open(resultURL);
    },
    handlePainter: function () {
        painting = false;
        var relativeX = 0;
        var relativeY = 0;
        var refPosition = spSketchImg.node.convertToWorldSpace(spSketchImg.node.position);
        if (refPosition != null && mousePosition != null) {
            relativeX = mousePosition.x - refPosition.x;
            relativeY = mousePosition.y - refPosition.y;
            var mouseInSketch = (relativeX > 0 && relativeY > 0 && relativeX < spSketchImg.node.width && relativeY < spSketchImg.node.height);
            if (mouseInSketch) {
                painting = true;
            }
        }
        if (painting) {
            if (mouseIsDown) {
                var cxt = HTML_Canvas_hint.getContext("2d");

                if (isPen) {
                    var pen = 2;
                    cxt.beginPath();
                    cxt.arc(parseInt(parseFloat(relativeX) / parseFloat(spHintNode.width) * parseFloat(HTML_Canvas_hint.width)), parseInt(parseFloat(spHintNode.height - relativeY) / parseFloat(spHintNode.height) * parseFloat(HTML_Canvas_hint.height)), pen, 0, Math.PI * 2, true);
                    cxt.closePath();
                    var color = spColorImg.node.color
                    cxt.fillStyle = 'rgba(' + color.r.toString() + ',' + color.g.toString() + ',' + color.b.toString() + ',0.618)';
                    cxt.fill();
                } else {
                    var cxt = HTML_Canvas_hint.getContext("2d");
                    cxt.clearRect(parseInt(parseFloat(relativeX) / parseFloat(spHintNode.width) * parseFloat(HTML_Canvas_hint.width)) - 10, parseInt(parseFloat(spHintNode.height - relativeY) / parseFloat(spHintNode.height) * parseFloat(HTML_Canvas_hint.height)) - 10, 20, 20);
                }

                var hintNodeTex = spHintNode.getComponent('cc.Sprite').spriteFrame.getTexture();
                hintNodeTex.initWithElement(HTML_Canvas_hint);
                hintNodeTex.handleLoadedTexture(true);
            }
        }
    },
    handleColorPicker: function () {
        var refPosition = spRefereneImg.node.convertToWorldSpace(spRefereneImg.node.position);
        if (refPosition != null && mousePosition != null) {
            var beginX = refPosition.x;
            var beginY = refPosition.y;
            var relativeX = mousePosition.x - beginX;
            var relativeY = mousePosition.y - beginY;
            mouseInReference = (relativeX > 0 && relativeY > 0 && relativeX < spRefereneImg.node.width && relativeY < spRefereneImg.node.height);
            if (mouseInReference) {
                if (!preMouseInRef) {
                    selectingColor = true;
                }
                if (getMouseDown) {
                    if (selectingColor) {
                        this.flag.x = relativeX - spRefereneImg.node.width / 2;
                        this.flag.y = relativeY - spRefereneImg.node.height / 2;
                        finalX = relativeX;
                        finalY = relativeY;
                        isPen = true;
                    }
                }
            } else {
                if (selectingColor) {
                    selectingColor = false;
                    var texture = spRefereneImg.spriteFrame.getTexture();
                    spColorImg.node.color = spRefereneImg.spriteFrame.getTexture().getPixels(finalX, finalY, spRefereneImg.node.width, spRefereneImg.node.height);
                }
            }
            if (selectingColor) {
                var texture = spRefereneImg.spriteFrame.getTexture();
                spColorImg.node.color = spRefereneImg.spriteFrame.getTexture().getPixels(relativeX, relativeY, spRefereneImg.node.width, spRefereneImg.node.height);
            }
        }
    },
    update: function (dt) {
        if (loaded) {
            this.handleColorPicker();
            this.handlePainter();
            if (selectingColor) {
                document.body.style.cursor = 'crosshair';
            }
            else if (painting) {
                document.body.style.cursor = 'crosshair';
            }
            else {
                document.body.style.cursor = 'default';
            }
        }
        preMouseInRef = mouseInReference;
        getMouseDown = false;

        var w = parseFloat(sketch_w);
        var h = parseFloat(sketch_h);
        var max_w = parseFloat(view_node.width - 64);
        var max_h = parseFloat(view_node.height);
        var s0 = max_w / w;
        var s1 = max_h / h;
        var s = Math.min(s0, s1);
        w = w * s;
        h = h * s;
        spSketchImg.node.width = parseInt(w);
        spSketchImg.node.height = parseInt(h);
        spHintNode.width = parseInt(w);
        spHintNode.height = parseInt(h);
        spResultImg.node.width = parseInt(w);
        spResultImg.node.height = parseInt(h);

        if (spBTN.enabled == false) {
            if (resultTexture != null) {
                if (resultTexture.isLoaded()) {
                    spResultImg.spriteFrame.setTexture(resultTexture);
                    spBTN.enabled = true;
                    spLAB.string = temp_btn_str;
                    sketchID = tempID[0];
                    referenceID = tempID[1];
                    this.waiting.opacity = 0;
                    this.quickBTN.opacity = 255;
                }
            }
        }
    },
});
