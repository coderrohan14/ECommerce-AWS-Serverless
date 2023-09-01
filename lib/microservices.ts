import { ITable } from "aws-cdk-lib/aws-dynamodb";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import {
  NodejsFunction,
  NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import path = require("path");

interface AppMicroservicesProps {
  productTable: ITable;
  basketTable: ITable;
  orderTable: ITable;
}

export class AppMicroservices extends Construct {
  public readonly productFunction: NodejsFunction;
  public readonly basketFunction: NodejsFunction;
  public readonly orderFunction: NodejsFunction;

  constructor(scope: Construct, id: string, props: AppMicroservicesProps) {
    super(scope, id);

    // Product Microservice Lambda Function
    this.productFunction = this.createProductFunction(props.productTable);

    // Basket Microservice Lambda Function
    this.basketFunction = this.createBasketFunction(props.basketTable);

    // Order Microservice Lambda Function
    this.orderFunction = this.createOrderFunction(props.orderTable);
  }

  private createProductFunction(productTable: ITable): NodejsFunction {
    const nodeJsFunctionProps: NodejsFunctionProps = {
      bundling: {
        externalModules: ["aws-sdk"],
      },
      environment: {
        PRIMARY_KEY: "id",
        DYNAMO_DB_TABLE_NAME: productTable.tableName,
      },
      runtime: Runtime.NODEJS_18_X,
    };

    const productFunction = new NodejsFunction(this, "productLambdaFunction", {
      entry: path.join(__dirname, "/../src/product/index.js"),
      ...nodeJsFunctionProps,
    });

    productTable.grantReadWriteData(productFunction);
    return productFunction;
  }

  private createBasketFunction(basketTable: ITable): NodejsFunction {
    const nodeJsFunctionProps: NodejsFunctionProps = {
      bundling: {
        externalModules: ["aws-sdk"],
      },
      environment: {
        PRIMARY_KEY: "userName",
        DYNAMO_DB_TABLE_NAME: basketTable.tableName,
        EVENT_SOURCE: "com.app.basket.checkoutBasket",
        EVENT_DETAILTYPE: "CheckoutBasket",
        EVENT_BUSNAME: "AppEventBus",
      },
      runtime: Runtime.NODEJS_18_X,
    };

    const basketFunction = new NodejsFunction(this, "basketLambdaFunction", {
      entry: path.join(__dirname, "/../src/basket/index.js"),
      ...nodeJsFunctionProps,
    });

    basketTable.grantReadWriteData(basketFunction);
    return basketFunction;
  }

  private createOrderFunction(orderTable: ITable): NodejsFunction {
    const nodeJsFunctionProps: NodejsFunctionProps = {
      bundling: {
        externalModules: ["aws-sdk"],
      },
      environment: {
        PRIMARY_KEY: "userName",
        SORT_KEY: "orderDate",
        DYNAMODB_TABLE_NAME: orderTable.tableName,
      },
      runtime: Runtime.NODEJS_18_X,
    };

    const orderFunction = new NodejsFunction(this, "orderLambdaFunction", {
      entry: path.join(__dirname, "/../src/ordering/index.js"),
      ...nodeJsFunctionProps,
    });

    orderTable.grantReadWriteData(orderFunction);
    return orderFunction;
  }
}
