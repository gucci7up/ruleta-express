import { PrismaClient, BetType, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── Colores ──────────────────────────────────────────────
  const verde = await prisma.color.upsert({
    where: { name: 'VERDE' },
    update: {},
    create: { name: 'VERDE', hex: '#00C851' },
  });
  const rojo = await prisma.color.upsert({
    where: { name: 'ROJO' },
    update: {},
    create: { name: 'ROJO', hex: '#FF4444' },
  });
  const negro = await prisma.color.upsert({
    where: { name: 'NEGRO' },
    update: {},
    create: { name: 'NEGRO', hex: '#222222' },
  });

  console.log('✅ Colores creados');

  // ── Mapping número → color (0-18) ────────────────────────
  // 0 = Verde, impares = Rojo, pares > 0 = Negro
  const numberColorMap: { number: number; colorId: number }[] = [];
  for (let i = 0; i <= 18; i++) {
    let colorId: number;
    if (i === 0) colorId = verde.id;
    else if (i % 2 !== 0) colorId = rojo.id;
    else colorId = negro.id;
    numberColorMap.push({ number: i, colorId });
  }

  for (const entry of numberColorMap) {
    await prisma.numberColor.upsert({
      where: { number: entry.number },
      update: { colorId: entry.colorId },
      create: entry,
    });
  }

  console.log('✅ Mapping números-colores (0-18) creado');

  // ── Tabla de pagos ────────────────────────────────────────
  // Apuesta por número: ×18 para cualquier número (0-18)
  for (let i = 0; i <= 18; i++) {
    await prisma.payout.upsert({
      where: { type_reference: { type: BetType.NUMBER, reference: String(i) } },
      update: { multiplier: 18 },
      create: {
        type: BetType.NUMBER,
        reference: String(i),
        multiplier: 18,
        description: `Apuesta al número ${i}`,
      },
    });
  }

  // Apuesta por color
  await prisma.payout.upsert({
    where: { type_reference: { type: BetType.COLOR, reference: 'ROJO' } },
    update: { multiplier: 2 },
    create: {
      type: BetType.COLOR,
      reference: 'ROJO',
      multiplier: 2,
      colorId: rojo.id,
      description: 'Apuesta al color Rojo',
    },
  });
  await prisma.payout.upsert({
    where: { type_reference: { type: BetType.COLOR, reference: 'NEGRO' } },
    update: { multiplier: 2 },
    create: {
      type: BetType.COLOR,
      reference: 'NEGRO',
      multiplier: 2,
      colorId: negro.id,
      description: 'Apuesta al color Negro',
    },
  });
  await prisma.payout.upsert({
    where: { type_reference: { type: BetType.COLOR, reference: 'VERDE' } },
    update: { multiplier: 18 },
    create: {
      type: BetType.COLOR,
      reference: 'VERDE',
      multiplier: 18,
      colorId: verde.id,
      description: 'Apuesta al color Verde',
    },
  });

  console.log('✅ Tabla de pagos creada');

  // ── Settings ──────────────────────────────────────────────
  const settings = [
    { key: 'round.duration_minutes', value: '5', description: 'Duración de cada ronda en minutos' },
    { key: 'round.close_warning_seconds', value: '30', description: 'Segundos de aviso antes del cierre' },
    { key: 'round.draw_duration_seconds', value: '20', description: 'Duración de la animación del sorteo' },
    { key: 'round.finish_pause_seconds', value: '10', description: 'Pausa tras mostrar resultado antes de nueva ronda' },
    { key: 'bet.min_amount', value: '10', description: 'Monto mínimo por selección (RD$)' },
    { key: 'bet.max_amount', value: '1000', description: 'Monto máximo por selección (RD$)' },
    { key: 'app.name', value: 'Ruleta Express', description: 'Nombre de la aplicación' },
    { key: 'app.currency', value: 'RD$', description: 'Símbolo de moneda' },
  ];

  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }

  console.log('✅ Settings creados');

  // ── Sucursal y terminal por defecto ───────────────────────
  const branch = await prisma.branch.upsert({
    where: { id: 1 },
    update: {},
    create: { name: 'Sucursal Principal', address: 'Dirección Principal' },
  });

  const terminal = await prisma.terminal.upsert({
    where: { id: 1 },
    update: {},
    create: { name: 'Terminal 1', branchId: branch.id },
  });

  console.log('✅ Sucursal y terminal creadas');

  // ── Usuario administrador ─────────────────────────────────
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@ruleta.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@ruleta.com',
      password: adminPassword,
      role: UserRole.SUPERADMIN,
      branchId: branch.id,
    },
  });

  const operatorPassword = await bcrypt.hash('operator123', 10);
  const pinHash = await bcrypt.hash('1234', 10);
  await prisma.user.upsert({
    where: { email: 'cajero@ruleta.com' },
    update: {},
    create: {
      name: 'Cajero Demo',
      email: 'cajero@ruleta.com',
      password: operatorPassword,
      pin: pinHash,
      role: UserRole.OPERATOR,
      branchId: branch.id,
      terminalId: terminal.id,
    },
  });

  console.log('✅ Usuarios creados');
  console.log('');
  console.log('🎉 Seed completado!');
  console.log('   Admin: admin@ruleta.com / admin123');
  console.log('   Cajero: cajero@ruleta.com / operator123 (PIN: 1234)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
