import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main(){
  const u = await prisma.user.upsert({ where:{ email:'demo@example.com' }, update:{}, create:{ id:'demo-user-1', email:'demo@example.com', name:'Demo User' }});
  await prisma.buyer.createMany({
    data: [
      { fullName:'Ravi Kumar', phone:'9876500000', city:'Chandigarh', propertyType:'Apartment', bhk:'_2', purpose:'Buy', timeline:'0-3m', source:'Website', ownerId:u.id },
      { fullName:'Sita Sharma', phone:'9876511111', city:'Mohali', propertyType:'Plot', purpose:'Buy', timeline:'3-6m', source:'Referral', ownerId:u.id }
    ]
  });
}
main().catch(e=>{console.error(e); process.exit(1)}).finally(()=>process.exit());
