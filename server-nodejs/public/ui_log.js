
    require(['domReady'], function (domReady) {
        domReady(function () {
            //loadBtUpload(); 


				var button = document.getElementById('but_log');
				button.addEventListener('click', function(e){
					show_log();
				});


        });
    });

		function show_log(){
			offsetElements = 0;
			compLog(document.querySelector('#contents'));
			tableBody = document.querySelector('#contents tbody');
		}

	/**
	* Generate Log Table
	* 
	*/
	var ui_log = {
	};
		nbElements = 100;
		offsetElements = 0;

	compLog = function(container){
		container.innerHTML = '';
		var tableBody = tableLog(container);
		damas.search_mongo({'time': {$exists:true}, '#parent':{$exists:true}}, {"time":-1},nbElements,offsetElements, function(res){
			damas.read(res, function(assets){ 
				tableLogContent(tableBody, assets);
					offsetElements += nbElements;
			});
		});
	};

	var scrollElem = window;

	scrollElem.addEventListener('scroll', function(){
	//console.log(scrollElem.scrollY);
		//if (scrollElem.scrollHeight - scrollElem.scrollTop === scrollElem.clientHeight){
		if (scrollElem.scrollY === scrollElem.scrollMaxY){
			damas.search_mongo({'time': {$exists:true}, '#parent':{$exists:true}}, {"time":-1},nbElements,offsetElements, function(res){
				damas.read(res, function(assets){
					tableLogContent(tableBody, assets);
					offsetElements += nbElements;
				});
			});
		}
	});



function tableLog(container) {
	var table = document.createElement('table');
	var thead = document.createElement('thead');
	var th1 = document.createElement('th');
	var th2 = document.createElement('th');
	var th3 = document.createElement('th');
	var tbody = document.createElement('tbody');

	table.className = 'log';

	th1.innerHTML = 'time &xutri;';
	th2.innerHTML = 'file';
	th3.innerHTML = 'comment';

	th1.style.width = '15ex';
	th1.style.width = '15ex';
	
	thead.appendChild(th1);
	thead.appendChild(th2);
	thead.appendChild(th3);
	table.appendChild(thead);
	table.appendChild(tbody);

	container.appendChild(table);
	return tbody;
}

/**
* Generate Table Content
* 
*/
function tableLogContent(container, assets) {
	for (var i=0; i<assets.length; i++) {
		container.appendChild(tableLogTr(assets[i]));
	}
}

function tableLogTr(asset) {
	var tr = document.createElement('tr');
	var td1 = document.createElement('td');
	var td2 = document.createElement('td');
	var td3 = document.createElement('td');
	//td2.className = 'clickable';
	var time = new Date(parseInt(asset.time));
	var file = asset.file || asset['#parent'];
	td1.setAttribute('title', time);
	td1.style.width = '15ex';
	td1.innerHTML = ('00'+time.getDate()).slice(-2)+'/'+('00'+time.getMonth()).slice(-2)+' '+('00'+time.getHours()).slice(-2)+':'+('00'+time.getMinutes()).slice(-2)+':'+('00'+time.getSeconds()).slice(-2);
	td2.setAttribute('title', JSON_tooltip(asset));
	td2.innerHTML = '<span class="nomobile">'+file.split('/').slice(0,-1).join('/')+'/</span>'+file.split('/').pop();
	//td3.style.whiteSpace = 'normal';
	td3.innerHTML = '&lt;'+asset.author+'&gt; '+asset.comment;
	tr.appendChild(td1);
	tr.appendChild(td2);
	tr.appendChild(td3);
	return tr;
}

(function (root, factory) {
    if (typeof define === 'function' && define.amd) { // AMD
        define(['socket.io/socket.io'], factory);
    } else if (typeof module === 'object' && module.exports) { // Node
        module.exports = factory(require('socket.io-client'));
    } else { // Browser globals
        root.returnExports = factory(root.io);
    }
}(this, function (io) {
    if (typeof window !== 'undefined') {
        var address = location.protocol + '//' + location.host;
        var socket = io.connect(address, { path: '/socket.io' });

        window.addEventListener('beforeunload', function (event) {
            socket.close();
        });
    } else {
        // Suppose a local Socket.io server over TLS
        var address = 'wss://0.0.0.0:8443';
        var socket = io.connect(address, {
            path: '/socket.io',
            rejectUnauthorized: false
        });
    }

    socket.on('connect', function () {
        console.log('Connected to the Socket server ' + address);
    });

    socket.on('disconnect', function (reason) {
        console.log('Disconnected: ' + reason);
    });

    socket.on('create', function (nodes) {
        console.log(nodes.length + ' nodes created');
        console.log(nodes);
        var tbody = document.querySelector('tbody');
        nodes.forEach(function(node){
            if (node.time !== undefined && node['#parent'] !== undefined ) {
                var tr = tableLogTr(node);
                tr.style.opacity = '0';
                tbody.insertBefore(tr, tbody.firstChild);
                setTimeout(function() {
                    tr.style.opacity = '1';
                }, 1);
            }
        });
    });

    socket.on('update', function (nodes) {
        console.log(nodes.length + ' nodes updated');
        console.log(nodes);
    });

    socket.on('remove', function (nodes) {
        console.log(nodes.length + ' nodes removed');
        console.log(nodes);
    });

    return socket;
}));
