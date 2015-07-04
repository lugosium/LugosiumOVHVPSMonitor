## DESCRIPTION
A simple Symfony2 bundle. Monitor your OVH VPS monitor.

## HOW TO USE

- Add `"lugosium/lugosiumovhvpsmonitorbundle": "dev-master"` in `composer.json`, under `require` statement.

- Register bundle in `app/AppKernel.php` with `new Lugosium\Bundle\OVHVPSMonitorBundle\LugosiumOVHVPSMonitorBundle(),`

- Add in your app/config/routing.yml:
```
  lugosium_ovhvps_monitor:                                                            
    resource: "@LugosiumOVHVPSMonitorBundle/Resources/config/routing.yml"
```

- In your app/config/config.yml:
Add `- { resource: "@LugosiumOVHVPSMonitorBundle/Resources/config/config.yml" }` under imports statement.
Add at the end of the file with your keys:
```
lugosium_ovhvps_monitor:
    vps:
        zone: Your zone (example: EU)
        AK: Your application key
        AS: Your secret application key
        CK: Your consumer key
```

To obtain yours keys, go to https://eu.api.ovh.com/createApp/

## FINALLY
Open http://www.domain.com/lugosium/monitor
