var id = 1;

var data = {
	id: id++,
	data: null,
	parent: null,
	children: []
};
var changeRoot = false;

// Find tree's height
var findHeight = function(node) {
	if (node.data === null || !node) return 0;
  else {
    var left = node.children[0] ? findHeight(node.children[0]) : 0;
    var right = node.children[1] ? findHeight(node.children[1]) : 0;
    return 1 + ((left > right) ? left : right);
  }
};

// Binary Search Tree rotation
var rotateLeft = function(node, callback) {
	var parent = node.parent,
		leftChild = node.children[0],
		rightChild = node.children[1];

	if (rightChild.children.length === 0) {
		rightChild.children.push({ id: id++, data: null, parent: rightChild, children: [] });
		rightChild.children.push({ id: id++, data: null, parent: rightChild, children: [] });
	}

	if (parent === null) {	// Root node
		rightChild.children[0].parent = node;
		node.children[1] = rightChild.children[0];

		node.parent = rightChild;
		rightChild.children[0] = node;

		rightChild.parent = parent;
		data = rightChild;

		gLinks.selectAll('path').filter(function(d) {	// Update root node
			return d.data.id === node.parent.id;
		}).datum(d3.hierarchy(node).descendants()[0]);
		changeRoot = true;

	} else if (node === parent.children[0]) {	// Left child of parent
		rightChild.children[0].parent = node;
		node.children[1] = rightChild.children[0];

		node.parent = rightChild;
		rightChild.children[0] = node;

		rightChild.parent = parent;
		parent.children[0] = rightChild;

		changeRoot = false;

	} else if (node === parent.children[1]) {	// Right child of parent
		rightChild.children[0].parent = node;
		node.children[1] = rightChild.children[0];

		node.parent = rightChild;
		rightChild.children[0] = node;

		rightChild.parent = parent;
		parent.children[1] = rightChild;

		changeRoot = false;
	}

	if (node.children.length !== 0 && node.children[0].data === null && node.children[1].data === null) node.children = [];

	setTimeout(function() {
		if (callback instanceof Function) {
			callback();
		}
	}, duration);
};

var rotateRight = function(node, callback) {
	var parent = node.parent,
		leftChild = node.children[0],
		rightChild = node.children[1];

	if (leftChild.children.length === 0) {
		leftChild.children.push({ id: id++, data: null, parent: leftChild, children: [] });
		leftChild.children.push({ id: id++, data: null, parent: leftChild, children: [] });
	}

	if (parent === null) {	// Root node
		leftChild.children[1].parent = node;
		node.children[0] = leftChild.children[1];

		node.parent = leftChild;
		leftChild.children[1] = node;

		leftChild.parent = parent;
		data = leftChild;

		gLinks.selectAll('path').filter(function(d) {	// Update root node's link
			return d.data.id === node.parent.id;
		}).datum(d3.hierarchy(node).descendants()[0]);
		changeRoot = true;

	} else if (node === parent.children[0]) {	// Left child of parent
		leftChild.children[1].parent = node;
		node.children[0] = leftChild.children[1];

		node.parent = leftChild;
		leftChild.children[1] = node;

		leftChild.parent = parent;
		parent.children[0] = leftChild;

		changeRoot = false;

	} else if (node === parent.children[1]) {	// Left child of parent
		leftChild.children[1].parent = node;
		node.children[0] = leftChild.children[1];

		node.parent = leftChild;
		leftChild.children[1] = node;

		leftChild.parent = parent;
		parent.children[1] = leftChild;

		changeRoot = false;
	}

	if (node.children.length !== 0 && node.children[0].data === null && node.children[1].data === null) node.children = [];

	setTimeout(function() {
		if (callback instanceof Function) {
			callback();
		}
	}, duration);
};

// Node highlight for better visualization
var highlight = function(node) {
	var hlNode = gNodes.selectAll('circle').filter(function(d) {
		return d.data.id === node.id;
	});
	hlNode.transition()
		.duration(duration/3)
		.style('stroke', '#e74c3c')
		.style('stroke-width', '3.5px');
};

var removeHighlight = function(node) {
	var hlNode = gNodes.selectAll('circle').filter(function(d) {
		return d.data.id === node.id;
	});
	hlNode.transition()
		.duration(duration/3)
		.style('stroke', '#3498db')
		.style('stroke-width', '2.5px');
};

// AVL Tree balancing
var balance = function(node, callback) {
	highlight(node);
	var hLeft = node.children[0] ? findHeight(node.children[0]) : 0;
	var hRight = node.children[1] ? findHeight(node.children[1]) : 0;
	var hl, hr,
		defer = 0.5;
	if (hLeft - hRight >= 2) { // Left unbalance
		var leftChild = node.children[0];
		hl = leftChild.children[0] ? findHeight(leftChild.children[0]) : 0;
		hr = leftChild.children[1] ? findHeight(leftChild.children[1]) : 0;
		if (hl >= hr) {	// Left of left
			rotateRight(node, updateTree);
			defer = 1;
		} else { // Right of left
			defer = 3;
			rotateLeft(leftChild, function() {
				updateTree();
				setTimeout(function() {
					rotateRight(node, updateTree);
				}, duration);
			});
		}
	} else if (hRight - hLeft >= 2) { // Right unbalance
		rotated = false;
		isChanged = true;
		var rightChild = node.children[1];
		hl = rightChild.children[0] ? findHeight(rightChild.children[0]) : 0;
		hr = rightChild.children[1] ? findHeight(rightChild.children[1]) : 0;
		if (hr >= hl) {	// Right of right
			rotateLeft(node, updateTree);
			defer = 1;
		} else { // Left of right
			defer = 3;
			rotateRight(rightChild, function() {
				updateTree();
				setTimeout(function() {
					rotateLeft(node, updateTree);
				}, duration);
			});
		}
	}
	setTimeout(function() {
		removeHighlight(node);
		if (!node.parent) { // End balancing
			if (callback instanceof Function) callback(); 
		}
		else balance(node.parent, callback);
	}, duration*defer);
};

// Tree insertion
var insert = function(n, callback) {
	console.log('Insert', n);
  if (!n || !Number.isInteger(n)) return;
  if (!data.data) {
    data.data = n;
    updateTree();
    callback();
    return;
  }

  var walker = data,
  	newNode;

  while (!newNode) {
    if (n <= walker.data) {
      if (walker.children.length === 0) { // No child
        walker.children.push({ id: id++, data: n, parent: walker, children: [] }); // Left child
        walker.children.push({ id: id++, data: null, parent: walker, children: [] }); // Empty right child
        newNode = walker.children[0];
      } else if (walker.children[0].data === null) { // Already have right child, left child is empty
      	walker.children[0].data = n;
      	newNode = walker.children[0];
      } else { // Move left
      	walker = walker.children[0];
      }
    } else {
      if (walker.children.length === 0) { // No child
        walker.children.push({ id: id++, data: null, parent: walker, children: [] }); // Empty left child
        walker.children.push({ id: id++, data: n, parent: walker, children: [] }); // Right child
        newNode = walker.children[1];
      } else if (walker.children[1].data === null) { // Already have left child, right child is empty
      	walker.children[1].data = n;
      	newNode = walker.children[1];
      } else { // Move left
      	walker = walker.children[1];
      }
    }
  }
  updateTree();
  setTimeout(function() {
  	balance(newNode, callback);
  	//callback();
  }, duration);
};

// Tree deletion
var deleteTree = function(n, callback) {
	if (!data.data) return false;
	var walker = data, 
		nodeDelete = null,	// Node to be deleted
		nodeReplace = null, // Node to replace deleted node
		nodeBalance = null, // After deleting, perform balance on this node to root
		parent;

	// Find node
	if (n === walker.data) { // Deleting root
		nodeDelete = walker;
		if (nodeDelete.children.length === 0) nodeDelete.data = null; // Tree only has root node
		else {
			if (nodeDelete.children[0].data === null) { // Root does not have left subtree
				data = data.children[1];	// Right subtree becomes new tree
				data.parent = null;

				gLinks.selectAll('path').filter(function(d) {
					return d.data.id === data.id;
				}).remove();
			} else {
				nodeReplace = nodeDelete.children[0];
				// In-order predecessor, largest child of left subtree
				while (nodeReplace) {
					if (!nodeReplace.children[1] || !nodeReplace.children[1].data) break;
					nodeReplace = nodeReplace.children[1];	
				}

				parent = nodeReplace.parent;
				nodeBalance = parent; // Will start balacing from this node

				if (parent.children[0] === nodeReplace) {
					if (nodeReplace.children[0]) {
						nodeReplace.children[0].parent = parent;
						parent.children[0] = nodeReplace.children[0]
					} else {
						parent.children[0] = { id: id++, data: null, parent: parent, children: [] };
					}
				}
				else if (parent.children[1] === nodeReplace) {
					if (nodeReplace.children[0]) {
						nodeReplace.children[0].parent = parent;
						parent.children[1] = nodeReplace.children[0]
					} else {
						parent.children[1] = { id: id++, data: null, parent: parent, children: [] };
					}
				}
				// After moving, if nodeReplace's parent has 2 empty children
				if (parent.children.length !== 0 && parent.children[0].data === null && parent.children[1].data === null) parent.children = [];

				// Add 2 subtrees of old root to new root
				if (nodeDelete.children[0]) {
					nodeDelete.children[0].parent = nodeReplace;
					nodeReplace.children[0] = nodeDelete.children[0];
				}
				if (nodeDelete.children[1]) {
					nodeDelete.children[1].parent = nodeReplace;
					nodeReplace.children[1] = nodeDelete.children[1];
				}

				// Replace deleted root node by largest node of left subtree (in-order predecessor)
				nodeReplace.parent = null;
				data = nodeReplace;

				gLinks.selectAll('path').filter(function(d) {
					return d.data.id === nodeReplace.id;
				}).remove();
			}
		}

		updateTree();
		setTimeout(function() {
			if (nodeBalance) balance(nodeBalance, callback);
			else if (callback instanceof Function) callback();
		}, duration);
		return true;
	}

	// Finding node
	while (walker.data) {
		if (n < walker.data) walker = walker.children[0]; // Move left
		else if (n > walker.data) walker = walker.children[1]; // Move right
		else if (n === walker.data) {
			nodeDelete = walker;
			break;
		}
	}

	if (!nodeDelete) return false;

	// Deletion
	if (nodeDelete.children.length === 0) { // Node to be deleted is leaf node
		parent = nodeDelete.parent;
		nodeBalance = parent; // Will start balacing from this node

		if (parent.children[0] === nodeDelete) {	// Remove left child
			parent.children[0] = { id: id++, data: null, parent: parent, children: [] }; // Empty child
		}
		else if (parent.children[1] === nodeDelete) { // Remove right child
			parent.children[1] = { id: id++, data: null, parent: parent, children: [] };
		}

		if (parent.children.length !== 0 && parent.children[0].data === null && parent.children[1].data === null) parent.children = [];

	} else { // Node to be deleted is internal node
		nodeReplace = nodeDelete.children[0].data ? nodeDelete.children[0] : null;
		// In-order predecessor, largest child of left subtree
		while (nodeReplace) {
			if (!nodeReplace.children[1] || !nodeReplace.children[1].data) break;
			nodeReplace = nodeReplace.children[1];	
		}

		if (!nodeReplace) {	// No left child, right child of nodeDelete replace its position
			parent = nodeDelete.parent;
			nodeBalance = parent; // Will start balacing from this node

			nodeDelete.children[1].parent = parent;
			if (parent.children[0] === nodeDelete) parent.children[0] = nodeDelete.children[1]; // Left child of parent
			else if (parent.children[1] === nodeDelete) parent.children[1] = nodeDelete.children[1]; // Right child of parent
		} else {
			// Update nodeReplace's parent
			parent = nodeReplace.parent;
			nodeBalance = parent; // Will start balacing from this node

			if (parent.children[0] === nodeReplace) {
				if (nodeReplace.children[0]) {
					nodeReplace.children[0].parent = parent;
					parent.children[0] = nodeReplace.children[0]
				} else {
					parent.children[0] = { id: id++, data: null, parent: parent, children: [] };
				}
			}
			else if (parent.children[1] === nodeReplace) {
				if (nodeReplace.children[0]) {
					nodeReplace.children[0].parent = parent;
					parent.children[1] = nodeReplace.children[0]
				} else {
					parent.children[1] = { id: id++, data: null, parent: parent, children: [] };
				}
			}
			// After moving, if nodeReplace's parent has 2 empty children
			if (parent.children.length !== 0 && parent.children[0].data === null && parent.children[1].data === null) parent.children = [];

			// Replace deleted node by largest node of left subtree (in-order predecessor)
			parent = nodeDelete.parent;
			nodeReplace.parent = parent;
			if (parent.children[0] === nodeDelete) parent.children[0] = nodeReplace; // Left child of parent
			else if (parent.children[1] === nodeDelete) parent.children[1] = nodeReplace; // Right child of parent

			if (nodeDelete.children[0]) {
				nodeDelete.children[0].parent = nodeReplace;
				nodeReplace.children[0] = nodeDelete.children[0];
			}
			if (nodeDelete.children[1]) {
				nodeDelete.children[1].parent = nodeReplace;
				nodeReplace.children[1] = nodeDelete.children[1];
			}
		}
	}
	
	updateTree();
	setTimeout(function() {
		if (nodeBalance) balance(nodeBalance, callback);
		else if (callback instanceof Function) callback();
	}, duration);
	return true;
};

