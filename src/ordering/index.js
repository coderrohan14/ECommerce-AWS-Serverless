const {
  PutItemCommand,
  QueryCommand,
  ScanCommand,
} = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
import { ddbClient } from "./ddbClient";

exports.handler = async function (event) {
  console.log("request:", JSON.stringify(event, undefined, 2));

  if (event.Records != null) {
    // SQS Invocation
    await sqsInvocation(event);
  } else if (event["detail-type"] !== undefined) {
    // Event Bridge Invocation
    await eventBridgeInvocation(event);
  } else {
    // API Gateway Invocation -- return sync response
    return await apiGatewayInvocation(event);
  }
};

const sqsInvocation = async (event) => {
  console.log(`SQS Invocation Function. event : ${event}`);

  event.Records.forEach(async (record) => {
    console.log("Record: %j", record);

    const checkoutEventRequest = JSON.parse(record.body);
    // create order item into db
    await createOrder(checkoutEventRequest.detail);
  });
};

const eventBridgeInvocation = async (event) => {
  const basket = event.detail;
  await createOrder(basket);
};

const createOrder = async (basketCheckoutEvent) => {
  try {
    // set orderDate for SortKey of order dynamoDB
    const orderDate = new Date().toISOString();
    basketCheckoutEvent.orderDate = orderDate;
    console.log(basketCheckoutEvent);

    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Item: marshall(basketCheckoutEvent || {}),
    };

    const createResult = await ddbClient.send(new PutItemCommand(params));
    console.log(createResult);
    return createResult;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

const apiGatewayInvocation = async (event) => {
  // GET /order
  // GET /order/{username}

  let body;
  try {
    switch (event.httpMethod) {
      case "GET":
        if (event.pathParameters != null) {
          body = await getOrder(event);
        } else {
          body = await getAllOrders();
        }
        break;
      default:
        throw new Error(`Unsupported route: "${event.httpMethod}"`);
    }
    console.log(body);
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Successfully finished operation: "${event.httpMethod}"`,
        body: body,
      }),
    };
  } catch (e) {
    console.log(e);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to perform operation.",
        errorMsg: e.message,
        errorStack: e.stack,
      }),
    };
  }
};

const getOrder = async (event) => {
  console.log("getOrder");

  try {
    // expected request : endpoint/order/{username}?orderDate=timestamp
    const userName = event.pathParameters.userName;
    const orderDate = event.queryStringParameters.orderDate;

    const params = {
      KeyConditionExpression: "userName = :userName and orderDate = :orderDate",
      ExpressionAttributeValues: {
        ":userName": { S: userName },
        ":orderDate": { S: orderDate },
      },
      TableName: process.env.DYNAMODB_TABLE_NAME,
    };

    const { Items } = await ddbClient.send(new QueryCommand(params));

    console.log(Items);
    return Items ? Items.map((item) => unmarshall(item)) : {};
  } catch (e) {
    console.log(e);
    throw e;
  }
};

const getAllOrders = async () => {
  console.log("getAllOrders");
  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
    };

    const { Items } = await ddbClient.send(new ScanCommand(params));

    console.log(Items);
    return Items ? Items.map((item) => unmarshall(item)) : {};
  } catch (e) {
    console.log(e);
    throw e;
  }
};
