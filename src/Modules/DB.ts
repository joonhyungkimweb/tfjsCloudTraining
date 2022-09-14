import { DynamoDBClient, UpdateItemCommand, AttributeValue } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({
  region: 'ap-northeast-2',
});

const TABLE_NAME = process.env.TABLE_NAME;

const commandUpdate = (
  email: string,
  trainingSeq: string,
  status: 'ready' | 'training' | 'finished' | 'error',
  keys: Record<string, string>,
  values: Record<string, AttributeValue>,
  setExpression: string
) =>
  new UpdateItemCommand({
    TableName: TABLE_NAME,
    Key: {
      email: {
        S: email,
      },
      trainingSeq: {
        S: trainingSeq,
      },
    },
    ExpressionAttributeNames: { '#status': 'status', ...keys },
    ExpressionAttributeValues: { ':status': { S: status }, ...values },
    UpdateExpression: `SET #status = :status, ${setExpression}`,
  });

export const onStart = (email: string, trainingSeq: string, instanceId: string) =>
  client.send(
    commandUpdate(
      email,
      trainingSeq,
      'ready',
      { '#instanceId': 'instanceId' },
      { ':instanceId': { S: instanceId } },
      '#instanceId = :instanceId'
    )
  );

export const onTraining = (
  email: string,
  trainingSeq: string,
  history: Record<string, AttributeValue>,
  files: Record<string, AttributeValue>
) =>
  client.send(
    commandUpdate(
      email,
      trainingSeq,
      'training',
      { '#history': 'history', '#files': 'files' },
      { ':history': { L: [{ M: history }] }, ':files': { L: [{ M: files }] } },
      '#history = list_append(#history, :history), #files = list_append(#files, :files)'
    )
  );

export const onFinish = (email: string, trainingSeq: string) =>
  client.send(
    commandUpdate(
      email,
      trainingSeq,
      'finished',
      { '#finishTime': 'finishTime' },
      {
        ':finishTime': { N: `${+new Date()}` },
      },
      '#finishTime = :finishTime'
    )
  );

export const onError = (email: string, trainingSeq: string, errorMessage: string) =>
  client.send(
    commandUpdate(
      email,
      trainingSeq,
      'error',
      { '#errorMessage': 'errorMessage' },
      {
        ':errorMessage': { S: errorMessage },
      },
      '#errorMessage = :errorMessage'
    )
  );
