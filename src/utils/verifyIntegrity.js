const verifyIntegrity = (product)=>{
  return (
    product.order_Hash===product.production_Hash &&
    product.production_Hash === product.delivery_Hash
  );
}
module.exports=verifyIntegrity;