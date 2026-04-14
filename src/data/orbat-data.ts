// Shared ORBAT types and initial data — mirrored from Apex Command Console

export interface OrbatNode {
  id: string;
  name: string;
  type: "organization" | "regiment" | "unit" | "company" | "platoon" | "section";
  children: OrbatNode[];
  expanded?: boolean;
}

export const TYPE_META: Record<
  OrbatNode["type"],
  { color: string; childType?: OrbatNode["type"]; label: string }
> = {
  organization: { color: "160 72% 42%", childType: "regiment", label: "Organization" },
  regiment:     { color: "230 80% 60%", childType: "unit",      label: "Regiment" },
  unit:         { color: "280 65% 60%", childType: "company",   label: "Unit" },
  company:      { color: "40 96% 53%",  childType: "platoon",   label: "Company" },
  platoon:      { color: "200 80% 50%", childType: "section",   label: "Platoon" },
  section:      { color: "4 80% 58%",                           label: "Section" },
};

export const INITIAL_ORBAT: OrbatNode[] = [
  {
    id: "org-1", name: "Air Force", type: "organization", expanded: true,
    children: [
      {
        id: "reg-1", name: "Regiment", type: "regiment", expanded: true,
        children: [
          {
            id: "unit-1", name: "Unit", type: "unit", expanded: true,
            children: [
              {
                id: "comp-1", name: "Alpha Company", type: "company", expanded: true,
                children: [
                  { id: "plat-1", name: "1st Platoon", type: "platoon", expanded: true, children: [
                    { id: "sec-1", name: "1st Section", type: "section", children: [] },
                  ]},
                ],
              },
              {
                id: "comp-3", name: "Bravo Company", type: "company", expanded: false,
                children: [
                  { id: "plat-3", name: "1st Platoon", type: "platoon", children: [
                    { id: "sec-3", name: "1st Section", type: "section", children: [] },
                  ]},
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "org-2", name: "ARMY", type: "organization", expanded: false,
    children: [
      {
        id: "reg-2", name: "Regiment", type: "regiment", expanded: false,
        children: [
          {
            id: "unit-2", name: "Unit", type: "unit", children: [
              { id: "comp-2", name: "Charlie Company", type: "company", children: [
                { id: "plat-2", name: "1st Platoon", type: "platoon", children: [
                  { id: "sec-2", name: "1st Section", type: "section", children: [] },
                ]},
              ]},
            ],
          },
        ],
      },
    ],
  },
];

// Collect all company nodes from the tree
export function getCompanies(nodes: OrbatNode[]): { id: string; name: string; path: string }[] {
  const result: { id: string; name: string; path: string }[] = [];

  function walk(node: OrbatNode, path: string[]) {
    const currentPath = [...path, node.name];
    if (node.type === 'company') {
      result.push({ id: node.id, name: node.name, path: currentPath.join(' › ') });
    }
    node.children.forEach(c => walk(c, currentPath));
  }

  nodes.forEach(n => walk(n, []));
  return result;
}

// Dummy trainees per company
export const TRAINEES_BY_COMPANY: Record<string, { id: string; name: string; rank: string }[]> = {
  'comp-1': [
    { id: 'T001', name: 'Johnson, M.', rank: 'PFC' },
    { id: 'T002', name: 'Williams, K.', rank: 'SPC' },
    { id: 'T003', name: 'Davis, R.', rank: 'PV2' },
    { id: 'T007', name: 'Anderson, L.', rank: 'SSG' },
    { id: 'T008', name: 'Thomas, P.', rank: 'PV2' },
  ],
  'comp-2': [
    { id: 'T004', name: 'Martinez, A.', rank: 'SGT' },
    { id: 'T005', name: 'Brown, J.', rank: 'PFC' },
    { id: 'T009', name: 'Jackson, D.', rank: 'SPC' },
  ],
  'comp-3': [
    { id: 'T006', name: 'Taylor, S.', rank: 'CPL' },
    { id: 'T010', name: 'White, C.', rank: 'PFC' },
    { id: 'T011', name: 'Harris, B.', rank: 'SGT' },
    { id: 'T012', name: 'Clark, E.', rank: 'CPL' },
  ],
};
