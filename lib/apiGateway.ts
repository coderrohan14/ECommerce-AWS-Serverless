import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

interface AppApiGatewayProps {
  productFunction: IFunction;
  basketFunction: IFunction;
  orderFunction: IFunction;
}

export class AppApiGateway extends Construct {
  constructor(scope: Construct, id: string, props: AppApiGatewayProps) {
    super(scope, id);

    // Product Microservice API Gateway
    this.createProductApi(props.productFunction);

    // Basket Microservice API Gateway
    this.createBasketApi(props.basketFunction);

    // Order Microservice API Gateway
    this.createOrderApi(props.orderFunction);
  }

  private createProductApi(productFunction: IFunction) {
    const productApi = new LambdaRestApi(this, "productApi", {
      restApiName: "Product Service",
      handler: productFunction,
      proxy: false,
    });

    const product = productApi.root.addResource("product");
    product.addMethod("GET"); // GET /product
    product.addMethod("POST"); // POST /product

    const singleProduct = product.addResource("{id}"); // product/id
    singleProduct.addMethod("GET"); // GET product/{id}
    singleProduct.addMethod("PUT"); // PUT product/{id}
    singleProduct.addMethod("DELETE"); // DELETE product/{id}
  }

  private createBasketApi(basketFunction: IFunction) {
    const basketApi = new LambdaRestApi(this, "basketApi", {
      restApiName: "Basket Service",
      handler: basketFunction,
      proxy: false,
    });

    const basket = basketApi.root.addResource("basket");
    basket.addMethod("GET"); // GET /basket
    basket.addMethod("POST"); // POST /basket

    const singleBasket = basket.addResource("{userName}");
    singleBasket.addMethod("GET"); // GET /basket/{userName}
    singleBasket.addMethod("DELETE"); // DELETE /basket/{userName}

    const basketCheckout = basket.addResource("checkout");
    basketCheckout.addMethod("POST"); // POST /basket/checkout
    // expected request payload: {userName: xyz}
  }

  private createOrderApi(orderFunction: IFunction) {
    const orderAPI = new LambdaRestApi(this, "orderAPI", {
      restApiName: "Ordering Service",
      handler: orderFunction,
      proxy: false,
    });

    const order = orderAPI.root.addResource("order");
    order.addMethod("GET"); // GET /order

    const singleOrder = order.addResource("{userName}");
    singleOrder.addMethod("GET"); // GET /order/{userName}
    // expected request: xxx/order/username?orderDate=timestamp
  }
}
