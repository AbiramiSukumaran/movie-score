
package gcfv2;

import com.google.cloud.functions.HttpFunction;
import com.google.cloud.functions.HttpRequest;
import com.google.cloud.functions.HttpResponse;
import java.io.BufferedWriter;

import com.google.cloud.aiplatform.util.ValueConverter;
import com.google.cloud.aiplatform.v1.EndpointName;
import com.google.cloud.aiplatform.v1.PredictResponse;
import com.google.cloud.aiplatform.v1.PredictionServiceClient;
import com.google.cloud.aiplatform.v1.PredictionServiceSettings;
import com.google.cloud.aiplatform.v1.schema.predict.prediction.TabularClassificationPredictionResult;
import com.google.protobuf.ListValue;
import com.google.protobuf.Value;
import com.google.protobuf.util.JsonFormat;
import java.io.IOException;
import java.util.List;
import java.util.ArrayList;

import com.mongodb.*;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Filters;
import com.mongodb.client.MongoCursor;
import com.mongodb.client.model.Projections;
import com.mongodb.client.model.Sorts;
import static com.mongodb.client.model.Filters.eq;
import static com.mongodb.client.model.Filters.lt;

import com.mongodb.client.model.UpdateOptions;
import com.mongodb.client.model.Updates;
import com.mongodb.client.result.UpdateResult;
import com.mongodb.client.result.*;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.bson.conversions.Bson;

public class HelloHttpFunction implements HttpFunction {
  @Override
  public void service(HttpRequest request, HttpResponse response) throws Exception {
    BufferedWriter writer = response.getWriter();
      String project = "YOUR_PROJECT";
      String endpointId = "YOUR_ENDPOINT";
      //Sample param "movieDetail" = "[{ 'name':'The Kid Who Would Be King','rating':'PG','genre':'action','year':2019,'released':'1/25/2019','director':'Joe Cornish','writer':'Joe Cornish','star':'Louis Ashbourne Serkis','country':'United Kingdom','budget':59000000,'company':'Big Talk Productions','runtime':120}]";
      String instance = request.getQueryParameters().get("movieDetail").get(0);
      String title = request.getQueryParameters().get("title").get(0);
      writer.write(predictTabularClassification(instance, project, endpointId, title));
  }

// [START aiplatform_predict_tabular_classification_sample]

  static String predictTabularClassification(String instance, String project, String endpointId, String title)
      throws IOException {
        
    PredictionServiceSettings predictionServiceSettings =
        PredictionServiceSettings.newBuilder()
            .setEndpoint("us-central1-aiplatform.googleapis.com:443")
            .build();
      int cls = 0;
  
    try (PredictionServiceClient predictionServiceClient =
        PredictionServiceClient.create(predictionServiceSettings)) {
      String location = "us-central1";
      
      EndpointName endpointName = EndpointName.of(project, location, endpointId);

      ListValue.Builder listValue = ListValue.newBuilder();
      JsonFormat.parser().merge(instance, listValue);
      List<Value> instanceList = listValue.getValuesList();

      Value parameters = Value.newBuilder().setListValue(listValue).build();
      PredictResponse predictResponse =
          predictionServiceClient.predict(endpointName, instanceList, parameters);
      System.out.println("Predict Tabular Classification Response");
      System.out.format("\tDeployed Model Id: %s\n", predictResponse.getDeployedModelId());

      System.out.println("Predictions");
   double score = 0.0;
      for (Value prediction : predictResponse.getPredictionsList()) {
        TabularClassificationPredictionResult.Builder resultBuilder =
            TabularClassificationPredictionResult.newBuilder();
        TabularClassificationPredictionResult result =
            (TabularClassificationPredictionResult)
                ValueConverter.fromValue(resultBuilder, prediction);
   System.out.println(result.getClassesCount());


      for (int i = 0; i < result.getClassesCount(); i++) {
          System.out.printf("\tClass: %s", result.getClasses(i));
          System.out.printf("\tScore: %f", result.getScores(i));
          if( (result.getScores(i) * 100) > score){
              score =  result.getScores(i) * 100;
              cls = Integer.parseInt(result.getClasses(i));
          } 
        }

      //Update score in MongoDB before printing
      try(MongoClient client = MongoClients.create("YOUR_CRED")) {
	  MongoDatabase database = client.getDatabase("movies");
    MongoCollection<Document> collection = database.getCollection("movies");

     Document query = new Document().append("name",  title);
            Bson updates = Updates.combine(
                    Updates.set("score", cls));
            UpdateOptions options = new UpdateOptions().upsert(true);

             try {
                UpdateResult results = collection.updateOne(query, updates, options);
                System.out.println("Modified document count: " + results.getModifiedCount());
                System.out.println("Upserted id: " + results.getUpsertedId()); // only contains a value when an upsert is performed
            } catch (MongoException me) {
                System.err.println("Unable to update due to an error*********: " + me);
            }

      }

      }
    
    
      
       System.out.println("Movie Prediction Result - Success Score is between " + (cls - 1) + " and " + cls);
    }
    return "" + cls;
  }

}
