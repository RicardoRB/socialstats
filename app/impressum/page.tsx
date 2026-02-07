import React from 'react';
import Link from 'next/link';

export default function Impressum() {
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
                    <h1 className="text-3xl font-bold mb-8">Impressum (Aviso Legal)</h1>

                    <section className="space-y-6">
                        <div>
                            <h2 className="text-xl font-semibold mb-2">Información según el § 5 de la TMG</h2>
                            <p className="text-muted-foreground">
                                Social Sync Inc.<br />
                                [Calle y Número]<br />
                                [Código Postal y Ciudad]<br />
                                Alemania
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold mb-2">Representado por:</h2>
                            <p className="text-muted-foreground">
                                [Nombre del representante legal]
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold mb-2">Contacto</h2>
                            <p className="text-muted-foreground">
                                Teléfono: [Número de teléfono]<br />
                                Email: [Email de contacto]
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold mb-2">Inscripción en el Registro</h2>
                            <p className="text-muted-foreground">
                                Inscripción en el Registro Mercantil (Handelsregister):<br />
                                Tribunal de registro: [Nombre del tribunal]<br />
                                Número de registro: [Número de registro]
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold mb-2">Número de Identificación del IVA</h2>
                            <p className="text-muted-foreground">
                                Número de identificación del IVA según el § 27 a de la Ley del Impuesto sobre el Valor Añadido (UStG):<br />
                                [USt-IdNr]
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold mb-2">Resolución de Litigios de la UE</h2>
                            <p className="text-muted-foreground">
                                La Comisión Europea ofrece una plataforma para la resolución de litigios en línea (ODR): <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://ec.europa.eu/consumers/odr/</a>.
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
