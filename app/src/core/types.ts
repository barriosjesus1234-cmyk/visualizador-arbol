export interface ExcelRow {
  code: string;
  description: string;
}

export interface TreeNode {
  id: string;
  code: string;
  description: string;
  children: TreeNode[];
  parentId: string | null;
  hyphenCount: number;
  isSuffixChild: boolean;
  isRoot: boolean;
  isOrphan: boolean;
  depth: number;
}

export interface TreeStats {
  total: number;
  zeroHyphen: number;
  oneHyphen: number;
  twoHyphen: number;
  suffixComponents: number;
  duplicates: number;
  orphans: number;
  maxDepth: number;
}

export interface Warning {
  type: 'duplicate' | 'noDescription' | 'noParent' | 'emptyRow';
  code?: string;
  message: string;
}

export interface AppState {
  tree: TreeNode[];
  stats: TreeStats | null;
  warnings: Warning[];
  selectedNode: TreeNode | null;
  expandedNodes: Set<string>;
  searchTerm: string;
  expansionLevel: number;
  breadcrumb: TreeNode[];
}
