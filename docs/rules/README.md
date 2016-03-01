# Rules
## Setting Rules
When setting rules you can specify the parameters to which a check should pass, and also whether that rules should flag as an 'error' or 'warning'.

### Check if a value is greater than expected
This will check to see if the result is less than the `max` value specified.
```json
{
  "rules": {
    "SpeedIndex": [{ "max": 2000 }, "error"]
  }
}
```

### Check if a value is less than expected
This will check to see if the result is less than the `min` value specified.
```json
{
  "rules": {
    "requestsJS": [{ "min": 1 }, "warning"]
  }
}
```

### Check if a value is within a range of values
This will check to see if the result is within a range of values, it will validate on `max` before `min`.
```json
{
  "rules": {
    "requestsDoc": [{ "min": 3, "max": 30 }, "warning"]
  }
}
```

### Check if value matches expected value
This will check to see if a result matches exactly with the value specified.
```json
{
  "rules": {
    "responses_404": [0, "error"]
  }
}
```

## Available Rules
This is the list of currently available rules to check against.

### loadTime
### TTFB
### bytesOut
### bytesOutDoc
### bytesIn
### bytesInDoc
### connections
### requestsFull
### requestsDoc
### requestsHTML
### requestsJS
### requestsCSS
### requestsImage
### requestsFlash
### requestsFont
### requestsOther
### responses_200
### responses_404
### responses_other
### result
### render
### fullyLoaded
### cached
### docTime
### domTime
### score_cache
### score_cdn
### score_gzip
### score_cookies
### score_keepAlive
### score_minify
### score_combine
### score_compress
### score_etags
### score_progressive_jpeg
### gzip_total
### gzip_savings
### minify_total
### minify_savings
### image_total
### image_savings
### optimization_checked
### aft
### domElements
### pageSpeedVersion
### titleTime
### loadEventStart
### loadEventEnd
### domContentLoadedEventStart
### domContentLoadedEventEnd
### lastVisualChange
### SpeedIndex
### visualComplete
### firstPaint
### docCPUms
### fullyLoadedCPUms
### docCPUpct
### fullyLoadedCPUpct
### browser_process_count
### browser_main_memory_kb
### browser_other_private_memory_kb
### browser_working_set_kb
### effectiveBps
### effectiveBpsDoc
