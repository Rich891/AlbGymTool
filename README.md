**Welcome to your Base44 project** 

**About**

View and Edit  your app on [Base44.com](http://Base44.com) 

This project contains everything you need to run your app locally.

**AlbGym Empfehlungsnavigator 2.0**

This branch starts the CRM-MVP described in the project documentation:

- Advisor access no longer uses a hardcoded frontend password. Internal routes are protected by the Base44 session and advisor/admin/trainer/service roles.
- `/berater/leads` adds the first Lead Cockpit for pipeline status, next action, appointment context, and trainer briefings.
- `/berater/rezepte` adds the first prescription intake workflow: scan upload, structured extraction, staff review mask, canonical customer upsert, Rehasport case creation, and scan record storage.
- Consultation closing now writes CRM-adjacent artifacts when the corresponding Base44 entities exist: `Lead`, `ActivityLog`, `FollowUpTask`, and `ContractDraft`.
- The scoring engine now maps the current anamnesis answers (`experience`, `schedule`, `complaints`, `lifestyle`) instead of the older field names.
- `Customer` is the canonical customer file. `RehasportConsultation` stores the Rehasport case/episode. `PrescriptionScan` stores scan metadata, extracted fields, reviewed fields, and the future AZH sync state.

Before using the CRM modules in production, create or verify these Base44 entities and permissions:

```text
Lead
Appointment
ActivityLog
FollowUpTask
ContractDraft
PrescriptionScan
Consent (optional, if consent history is split out from Customer)
```

Advisor users need one of these role keys on the Base44 user object: `admin`, `administrator`, `berater`, `advisor`, `trainer`, `coach`, `service`, or `sales`.

**AZH / myYOLO myConnect**

The myConnect API is not connected through a public OAuth button. AZH/myYOLO provides tenant-specific Basic Auth credentials for the myConnect endpoint. Store them as Base44 backend function secrets, never in frontend env vars:

```text
AZH_MYCONNECT_BASE_URL=https://myconnect.azh-myyolo.info
AZH_MYCONNECT_VERSION=1
AZH_MYCONNECT_USERNAME=...
AZH_MYCONNECT_PASSWORD=...
```

The `azhMyConnect` backend function supports `configStatus`, `queryPersons`, `findCustomer`, `upsertPerson`, and `syncCustomer`. It maps the canonical `Customer` record to myConnect `Person` fields and stores the returned myYOLO/AZH `Guid` back in `Customer.azh_person_guid`.

**Edit the code in your local development environment**

Any change pushed to the repo will also be reflected in the Base44 Builder.

**Prerequisites:** 

1. Clone the repository using the project's Git URL 
2. Navigate to the project directory
3. Install dependencies: `npm install`
4. Create an `.env.local` file and set the right environment variables

```
VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_APP_BASE_URL=your_backend_url

e.g.
VITE_BASE44_APP_ID=cbef744a8545c389ef439ea6
VITE_BASE44_APP_BASE_URL=https://my-to-do-list-81bfaad7.base44.app
```

Run the app: `npm run dev`

**Publish your changes**

Open [Base44.com](http://Base44.com) and click on Publish.

**Docs & Support**

Documentation: [https://docs.base44.com/Integrations/Using-GitHub](https://docs.base44.com/Integrations/Using-GitHub)

Support: [https://app.base44.com/support](https://app.base44.com/support)
