import React from 'react';
import Link from 'next/link';

export default function PrivacyPolicy() {
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
                    <h1 className="text-3xl font-bold mb-8">Política de Privacidad (Datenschutzerklärung)</h1>

                    <section className="space-y-6">
                        <div>
                            <h2 className="text-xl font-semibold mb-2">1. Información General</h2>
                            <p className="text-muted-foreground">
                                Social Sync Inc. se toma muy en serio la protección de sus datos personales. Tratamos sus datos de forma confidencial y de acuerdo con las disposiciones legales de protección de datos (especialmente el RGPD/DSGVO) y esta política de privacidad.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold mb-2">2. Responsable del Tratamiento</h2>
                            <p className="text-muted-foreground">
                                El responsable del tratamiento de datos en este sitio web es:<br />
                                [Nombre/Empresa]<br />
                                [Dirección]<br />
                                [Email de contacto]
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold mb-2">3. Recogida y Tratamiento de Datos</h2>
                            <p className="text-muted-foreground">
                                Recopilamos datos cuando usted se registra en nuestro Bootcamp, utiliza nuestra plataforma o se pone en contacto con nosotros. Esto incluye:
                            </p>
                            <ul className="list-disc ml-6 mt-2 text-muted-foreground">
                                <li>Datos de contacto (nombre, email, dirección).</li>
                                <li>Datos de cuenta (nombre de usuario, contraseña).</li>
                                <li>Datos de pago (procesados a través de proveedores externos).</li>
                                <li>Datos de métricas de redes sociales (cuando conecta sus cuentas).</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold mb-2">4. Base Legal</h2>
                            <p className="text-muted-foreground">
                                El tratamiento de sus datos se basa en las siguientes bases legales del RGPD:
                            </p>
                            <ul className="list-disc ml-6 mt-2 text-muted-foreground">
                                <li>Art. 6 (1) (b) RGPD: Para el cumplimiento de un contrato (inscripción al Bootcamp).</li>
                                <li>Art. 6 (1) (a) RGPD: Si nos ha dado su consentimiento.</li>
                                <li>Art. 6 (1) (f) RGPD: Por nuestro interés legítimo en mejorar nuestros servicios.</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold mb-2">5. Derechos del Interesado</h2>
                            <p className="text-muted-foreground">
                                Usted tiene derecho a:
                            </p>
                            <ul className="list-disc ml-6 mt-2 text-muted-foreground">
                                <li>Acceso a sus datos almacenados.</li>
                                <li>Rectificación de datos inexactos.</li>
                                <li>Supresión de sus datos (derecho al olvido).</li>
                                <li>Limitación del tratamiento.</li>
                                <li>Portabilidad de los datos.</li>
                                <li>Oposición al tratamiento.</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold mb-2">6. Proveedores de Servicios Externos</h2>
                            <p className="text-muted-foreground">
                                Utilizamos servicios de terceros para el funcionamiento de la plataforma:
                            </p>
                            <ul className="list-disc ml-6 mt-2 text-muted-foreground">
                                <li><strong>Supabase:</strong> Para autenticación y base de datos (almacenamiento en la UE siempre que sea posible).</li>
                                <li><strong>Vercel:</strong> Para el alojamiento del sitio web.</li>
                                <li><strong>APIs de Redes Sociales:</strong> Google/YouTube, X, Instagram, TikTok para la sincronización de métricas.</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold mb-2">7. Seguridad de los Datos</h2>
                            <p className="text-muted-foreground">
                                Este sitio utiliza el cifrado SSL o TLS por razones de seguridad y para proteger la transmisión de contenido confidencial.
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
