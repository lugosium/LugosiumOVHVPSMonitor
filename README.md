## DESCRIPTION
A simple Symfony2 bundle. Monitor your OVH VPS monitor.

## HOW TO USE

- In your symfony project, tape `composer require lugosium/lugosiumovhvpsmonitorbundle` to get the latest stable release of the bundle.

- Register bundle in `app/AppKernel.php` with `new Lugosium\Bundle\OVHVPSMonitorBundle\LugosiumOVHVPSMonitorBundle(),`

- Add in your app/config/routing.yml:
```
  lugosium_ovhvps_monitor:
    resource: "@LugosiumOVHVPSMonitorBundle/Resources/config/routing.yml"
```

- In your app/config/config.yml:
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

- Via ./bin/console, clear cache and install assets.

## FINALLY
Open http://www.domain.com/lugosium/monitor
