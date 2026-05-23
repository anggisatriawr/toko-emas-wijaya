import { prisma } from "./src/lib/prisma";
import bcrypt from "bcrypt";

async function test() {
  try {
    const user = await prisma.user.findUnique({where: {username: "admin"}});
    console.log("USER:", user);
    if (user) {
      const isMatch = await bcrypt.compare("admin123", user.password);
      console.log("MATCH ADMIN:", isMatch);
    }
    
    const emp = await prisma.user.findUnique({where: {username: "pegawai1"}});
    console.log("EMP:", emp);
    if (emp) {
      const isMatch = await bcrypt.compare("pegawai123", emp.password);
      console.log("MATCH EMP:", isMatch);
    }
  } catch(e) {
    console.error("ERROR:", e);
  }
}

test();
