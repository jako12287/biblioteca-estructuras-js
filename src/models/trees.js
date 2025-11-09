class TreeNode {
  constructor(key, value) {
    this.key = key;
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

export class BinarySearchTree {
  constructor() {
    this.root = null;
  }

  insert(key, value) {
    const node = new TreeNode(key, value);
    if (!this.root) {
      this.root = node;
      return;
    }
    this._insertNode(this.root, node);
  }

  _insertNode(current, node) {
    if (node.key < current.key) {
      if (!current.left) current.left = node;
      else this._insertNode(current.left, node);
    } else if (node.key > current.key) {
      if (!current.right) current.right = node;
      else this._insertNode(current.right, node);
    } else {
      current.value = node.value;
    }
  }

  search(key) {
    return this._searchNode(this.root, key);
  }

  _searchNode(current, key) {
    if (!current) return null;
    if (key === current.key) return current.value;
    if (key < current.key) return this._searchNode(current.left, key);
    return this._searchNode(current.right, key);
  }

  inOrder(callback) {
    this._inOrder(this.root, callback);
  }

  _inOrder(node, callback) {
    if (!node) return;
    this._inOrder(node.left, callback);
    callback(node.value);
    this._inOrder(node.right, callback);
  }
}

export function buildUserTree(usersArr) {
  const tree = new BinarySearchTree();
  for (const u of usersArr) {
    if (u.docId) {
      tree.insert(u.docId, u);
    }
  }
  return tree;
}

export function buildBookTree(booksArr) {
  const tree = new BinarySearchTree();
  for (const b of booksArr) {
    if (b.isbn) {
      tree.insert(b.isbn, b);
    }
  }
  return tree;
}
