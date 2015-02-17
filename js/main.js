function getEventTarget(e) { // handle IE event target
  e = e || window.event;
  return e.target || e.srcElement;
}

function useTransition() { // feature detection for CSS transition
    var s = document.documentElement.style;
    if (
        typeof s.webkitTransition !== 'undefined' ||
        typeof s.MozTransition !== 'undefined' ||
        typeof s.OTransition !== 'undefined' ||
        typeof s.MsTransition !== 'undefined' ||
        typeof s.transition !== 'undefined'
    ) {
        return true;
    } else {
        return false;
    }
}

function addItem(itemValue) {
    var inpValue = app.DOMelements.inpItem.value;
    if (typeof itemValue === 'string'){ // replace input value if a string was passed to fn()
        inpValue = itemValue.replace(/\"/g,'');
    }
    if (inpValue.length === 0){ // basic input validation
        app.DOMelements.inpItem.focus();
        alert('Please enter an item first.');
        return;
    }
    var liLast = app.DOMelements.oList.lastElementChild;
    var count = 0;
    if (liLast !== null) { // if there is at least one li, use it to set count
        var lnk = liLast.getElementsByTagName('A')[0];
        var strId = lnk.id;
        count = parseInt(strId.split('-')[1],10) + 1;
    }
    var liNew = document.createElement('LI');
    liNew.innerHTML = '<span>' + inpValue + '</span>';
    var lnkNew = document.createElement('A');
    lnkNew.innerHTML = 'delete';
    lnkNew.id = 'lnkDelete-' + count.toString();
    liNew.appendChild(lnkNew);
    app.DOMelements.oList.appendChild(liNew);
    app.DOMelements.inpItem.value = '';
    app.DOMelements.inpItem.focus();
    toJSON(); // reset the textarea
}

function deleteItem(target) { // fade the item out
    var liRemove = target.parentNode;
    if (app.useTransition === true){
        app.removeMe = liRemove;
        liRemove.className = 'fadeOut';
    } else {
        liRemove.parentNode.removeChild(liRemove);
        toJSON();
    }
}

function removeElement() { // remove li from the DOM
    app.DOMelements.oList.removeChild(app.removeMe);
    app.removeMe = null;
    toJSON();
}

function toJSON() {
    var liCollection = app.DOMelements.oList.getElementsByTagName('LI');
    var liArray = [];
    for (var i = 0, l = liCollection.length; i < l; i++){
        liArray.push(liCollection[i].childNodes[0].textContent); // we want the text
    }
    liArray = liArray.map(function(item, i){ // Array.map to properly stringify my JSON array
        return '"' + item + '"';
    });
    app.DOMelements.txtJSON.value = '[' + liArray.toString() + ']';
}

function fromJSON() {
    var strValue = app.DOMelements.txtJSON.value.replace(/^\[|\]$/g,''); // remove the square brackets at start and end of string
    app.DOMelements.oList.innerHTML = ''; // clear out the LIs
    var strArray;
    try {
        strArray = strValue.split(',');
        for (var i = 0, l = strArray.length; i < l; i++){
            if (strArray[i].length > 0){
                addItem(strArray[i]); // reuse the addItem function, passing a string parameter
            }
        }
    }
    catch(err) { // catch all errors
        alert('There was a problem with your data. Please try again.');
        return;
    }
}

var app = app || {}; // create an app namespace

document.addEventListener("DOMContentLoaded", function() { // modern browser method for DOM ready
    if (typeof app.useTrasition === 'undefined') {
        app.useTransition = useTransition();
    }

    app.DOMelements = {
        oList: document.getElementById('olItems'),
        txtJSON: document.getElementById('txtJSON'),
        inpItem: document.getElementById('inpItem')
    };

    document.onclick = function(e){ // basic event delegation for click events
        var target = getEventTarget(e);
        if (target.id){ // only respond to elements with an ID
            switch (true){
                case (target.id === 'btnAdd'):
                    addItem(target);
                break;
                case (target.id === 'btnLoad'):
                    fromJSON();
                break;
                case (target.id.indexOf('Delete') > -1): // respond to any link like lnkDelete-nn
                    deleteItem(target);
                break;
            }
        }
    };

    /* event handling for fading out the LIs */
    document.addEventListener('transitionend',
        removeElement, false
    );
    document.addEventListener('webkitTransitionEnd',
        removeElement, false
    );
    document.addEventListener('oTransitionEnd',
        removeElement, false
    );
    document.addEventListener('otransitionend',
        removeElement, false
    );
    document.addEventListener('MSTransitionEnd',
        removeElement, false
    );

    toJSON(); // setup the JSON field

    app.DOMelements.inpItem.focus();
});
