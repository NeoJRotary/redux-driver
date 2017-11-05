
export const reqAct = data => ({
  ...data,
  type: 'REQ'
});

export const resAct = data => ({
  data,
  type: 'RES'
});

export const graphReq = data => ({
  ...data,
  type: 'GRAPH_REQ',
  graphql: true
});

export const graphRes = data => ({
  ...data,
  type: 'GRAPH_RES'
});
