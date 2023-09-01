import * as cdk from "aws-cdk-lib";
import {
  AttributeType,
  BillingMode,
  ITable,
  Table,
} from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

export class AppDatabase extends Construct {
  public readonly productTable: ITable;
  public readonly basketTable: ITable;
  public readonly orderTable: ITable;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Product DynamoDB Table Creation
    this.productTable = this.createProductTable();

    // Basket DynamoDB Table Creation
    this.basketTable = this.createBasketTable();

    //Order DynamoDB Table Creation
    this.orderTable = this.createOrderTable();
  }

  private createProductTable(): ITable {
    const productTable = new Table(this, "product", {
      partitionKey: {
        name: "id",
        type: AttributeType.STRING,
      },
      tableName: "product",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
    });
    return productTable;
  }

  private createBasketTable(): ITable {
    const basketTable = new Table(this, "basket", {
      partitionKey: {
        name: "userName",
        type: AttributeType.STRING,
      },
      tableName: "basket",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
    });
    return basketTable;
  }

  private createOrderTable(): ITable {
    // PartitionKey - username, SortKey - orderDate
    const orderTable = new Table(this, "order", {
      partitionKey: {
        name: "userName",
        type: AttributeType.STRING,
      },
      sortKey: {
        name: "orderDate",
        type: AttributeType.STRING,
      },
      tableName: "order",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
    });
    return orderTable;
  }
}
