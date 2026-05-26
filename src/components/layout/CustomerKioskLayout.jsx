import React from 'react';
import { Outlet, Link } from 'react-router-dom';

/**
 * Kiosk-Layout fuer den Kunden-/Tablet-Modus (Sprint-1-AP-2).
 *
 * Sprint 1: nur Skeleton — kein Sidebar, full-screen, vorbereitet fuer
 * Tablet-Mode in MVP-2. Optionaler minimaler Header zeigt das Logo.
 * Konkrete Kiosk-Seiten ('/kiosk') werden via <Outlet /> eingebettet.
 *
 * Bewusst KEIN WorldSwitcher — im Kiosk-Modus sollen Mitarbeiter/Admin nicht
 * versehentlich zurueck in die internen Welten klicken koennen.
 */
export default function CustomerKioskLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-emerald-50 to-green-100 flex flex-col">
      {/* Minimaler Header — Logo center, kein Branding ueberladen */}
      <header className="px-6 py-4 flex items-center justify-center">
        <Link to="/kiosk" aria-label="Zur Kiosk-Startseite">
          <img
            src="https://media.base44.com/images/public/user_69ebb5f9878e5267e7fcc9b3/96b390eb9_AlbGymLogomark.png"
            alt="AlbGym"
            className="w-12 h-12 object-contain"
          />
        </Link>
      </header>

      {/* Content full-screen, zentriert fuer Tablets */}
      <main className="flex-1 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-3xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
