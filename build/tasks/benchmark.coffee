module.exports = ->
  #@loadNpmTasks "grunt-benchmark"

  @config "benchmark",
    options:
      displayResults: true

    all:
      src: ["test/benchmark/*.js"]
      dest: "test/report/benchmark_results.csv"
