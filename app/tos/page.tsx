import React from 'react';
import Link from 'next/link';

export default function TermsOfService() {
    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="text-xl font-bold tracking-tight">Social Sync</span>
                    </Link>
                </div>
            </header>

            <main className="flex-1 py-12">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold mb-8">Términos de Servicio (AGB) - Social Sync Bootcamp</h1>

                    <section className="space-y-6">
                        <div>
                            <h2 className="text-xl font-semibold mb-2">1. Ámbito de Aplicación</h2>
                            <p className="text-muted-foreground">
                                Estos Términos de Servicio (en adelante "AGB") se aplican a todos los contratos entre Social Sync Inc. (en adelante "el Proveedor") y los participantes del "Social Sync Bootcamp" (en adelante "el Participante").
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold mb-2">2. Objeto del Contrato</h2>
                            <p className="text-muted-foreground">
                                El objeto del contrato es la participación en el Bootcamp online de Social Sync, que incluye sesiones de formación, materiales didácticos y acceso a herramientas específicas según la descripción del programa vigente en el momento de la inscripción.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold mb-2">3. Inscripción y Conclusión del Contrato</h2>
                            <p className="text-muted-foreground">
                                La presentación del Bootcamp en el sitio web no constituye una oferta legalmente vinculante. Al hacer clic en el botón de inscripción, el Participante envía una oferta vinculante. El contrato se perfecciona únicamente tras la confirmación por escrito (vía email) por parte del Proveedor.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold mb-2">4. Tarifas y Condiciones de Pago</h2>
                            <p className="text-muted-foreground">
                                Se aplican los precios indicados en el momento de la inscripción. Todos los precios incluyen el IVA legal aplicable en Alemania, a menos que se indique lo contrario. El pago debe realizarse íntegramente antes del inicio del Bootcamp, salvo que se acuerde un plan de cuotas.
                            </p>
                        </div>

                        <div className="bg-muted p-6 rounded-lg">
                            <h2 className="text-xl font-semibold mb-2 text-foreground">5. Política de Desistimiento (Widerrufsbelehrung)</h2>
                            <p className="font-medium mb-2">Derecho de Desistimiento</p>
                            <p className="text-sm text-muted-foreground mb-4">
                                Usted tiene el derecho de desistir del presente contrato en un plazo de 14 días sin necesidad de justificación. El plazo de desistimiento expirará a los 14 días del día de la celebración del contrato.
                            </p>
                            <p className="text-sm text-muted-foreground mb-4">
                                Para ejercer el derecho de desistimiento, deberá notificarnos su decisión de desistir del contrato a través de una declaración inequívoca (por ejemplo, una carta enviada por correo postal o un correo electrónico a legal@socialsync.example).
                            </p>
                            <p className="font-medium mb-2">Consecuencias del Desistimiento</p>
                            <p className="text-sm text-muted-foreground">
                                En caso de desistimiento por su parte, le devolveremos todos los pagos recibidos de usted sin ninguna demora indebida y, en todo caso, a más tardar 14 días a partir de la fecha en la que se nos informe de su decisión de desistir del presente contrato.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold mb-2">6. Cancelación y No Asistencia</h2>
                            <p className="text-muted-foreground">
                                Las cancelaciones fuera del periodo de desistimiento legal pueden estar sujetas a gastos de gestión. La no asistencia a las sesiones en vivo no exime del pago de la cuota del Bootcamp.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold mb-2">7. Derechos de Autor</h2>
                            <p className="text-muted-foreground">
                                Todos los materiales proporcionados durante el Bootcamp están protegidos por derechos de autor. Se concede al Participante una licencia limitada, no exclusiva e intransferible para uso personal y educativo.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold mb-2">8. Responsabilidad</h2>
                            <p className="text-muted-foreground">
                                El Proveedor es responsable ilimitado en caso de dolo o negligencia grave. En caso de negligencia leve, la responsabilidad se limita a la violación de obligaciones contractuales esenciales (obligaciones cardinales).
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold mb-2">9. Ley Aplicable y Jurisdicción</h2>
                            <p className="text-muted-foreground">
                                Se aplica el derecho de la República Federal de Alemania, con exclusión de la Convención de las Naciones Unidas sobre los Contratos de Compraventa Internacional de Mercaderías (CISG). Si el Participante es un consumidor, esta elección de ley solo se aplicará en la medida en que no se vea privado de la protección que le conceden las disposiciones obligatorias del país en el que tenga su residencia habitual.
                            </p>
                        </div>
                    </section>
                </div>
            </main>

            <footer className="border-t py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
                    <p>Built by Social Sync Inc. &copy; {new Date().getFullYear()}</p>
                </div>
            </footer>
        </div>
    );
}
