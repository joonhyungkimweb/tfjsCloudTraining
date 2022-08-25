import { parseCsvData, UnheadedCSV } from './CSVPaser';
import { getObject } from './Storage';
import { tensor } from '@tensorflow/tfjs-node';

const loadCSVDataset = async (datasetURL: string) => {
  const {
    data: [, ...data],
  } = await parseCsvData((await getObject(datasetURL)).Body as Blob);
  return data;
};
const isSelectedColumn = (columns: number[], index: number) => columns.includes(index);

const extractColumns = (dataSet: UnheadedCSV[], columns: number[]) =>
  dataSet.map((data) => data.filter((_, index) => isSelectedColumn(columns, index)));

export const loadAndProcessCSVData = async (
  datasetURL: string,
  xColumns: number[],
  yColumns: number[]
) => {
  const data = await loadCSVDataset(datasetURL);
  const xsArray = extractColumns(data, xColumns);
  const ysArray = extractColumns(data, yColumns);
  return {
    xs: tensor(xsArray),
    ys: tensor(ysArray),
  };
};