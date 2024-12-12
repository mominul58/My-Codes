install.packages("reticulate")
library(reticulate)
install.packages("tensorflow")
library(tensorflow)
install_tensorflow(version = "2.13.0")
install_miniconda()
library(keras)
install_keras(method = "conda")
install.packages("readxl")
library(readxl)

data <- read_excel("C://Users//SkyTech//OneDrive//Desktop//Shawon bahi//P_DL.xlsx")
View(data)
str(data)

# Change to Matrix
data <- as.matrix(data)
dimnames(data) <- NULL
str(data)

#Normalize
data[, 1:13] <- normalize(data[,1:13])
data[,14] <- as.numeric(data[,14]) -1
summary(data)

# Data Partition
set.seed(1234)
ind <- sample(2, nrow(data), replace = T, prob = c(0.7,0.3))
training <- data[ind==1, 1:13]
test <- data [ind==2, 1:13]
trainingtarget <- data[ind==1, 14]
testtarget <- data[ind==2, 14]

# One Hot Encoding
trainlables <- to_categorical(trainingtarget)
testlables <- to_categorical(testtarget)
print (testlables)

#Create sequential model

model <- keras_model_sequential()
model %>%
  layer_dense(units = 50, activation = "relu", input_shape = c(13)) %>%
  layer_dense(units = 5, activation = "softmax")
summary(model)

model %>%
  layer_dense(units = 4096, activation = "relu", input_shape = c(13)) %>%
  layer_dropout(rate = 0.35) %>%
  layer_dense(units = 2048, activation = "relu") %>%
  layer_dropout(rate = 0.3) %>%
  layer_dense(units = 1024, activation = "relu") %>%
  layer_dropout(rate = 0.25) %>%
  layer_dense(units = 512, activation = "relu") %>%
  layer_dropout(rate = 0.2) %>%
  layer_dense(units = 256, activation = "relu") %>%
  layer_dropout(rate = 0.15) %>%
  layer_dense(units = 128, activation = "relu") %>%
  layer_dropout(rate = 0.1) %>%
  layer_dense(units = 64, activation = "relu") %>%
  layer_dropout(rate = 0.05) %>%
  layer_dense(units = 32, activation = "relu") %>%
  layer_dense(units = 16, activation = "relu") %>%
  layer_dense(units = 5, activation = "softmax")
summary(model)

?layer_dense
?activation_relu

# Compile
model%>%
  compile(loss="categorical_crossentropy",
          optimizer = optimizer_adam(learning_rate = 0.0005),
          metrics = c("accuracy"))

#Fit Model
history <- model %>%
  fit(training,
      trainlables,
      epochs = 200,
      batch_size = 64,
      validation_split = 0.2)
plot(history)

#Evaluate model with test data
model1 <- model %>%
  evaluate(test,testlables)
model2 <- model %>%
  evaluate(test,testlables)
model3 <- model %>%
  evaluate(test,testlables)


# Prediction & Confusion matrxi - test data

prob <- model %>%
  predict(test)
pred <- model %>% predict(test)
pred_class <- k_argmax(pred) %>% as.numeric()

table1 <- table(Predicted = pred_class, Actual = testtarget)
table2 <- table(Predicted = pred_class, Actual = testtarget)
table3 <- table(Predicted = pred_class, Actual = testtarget)

confusion_matrix <- table(Predicted = pred_class, Actual = testtarget)
print(confusion_matrix)

Pred_data <- cbind(prob, pred_class, testtarget)

#Fine Tune Model
model1
model2
model3
table1
table2
table3

# R²
actual_mean <- mean(testtarget)
ss_total <- sum((testtarget - actual_mean)^2)
ss_residual <- sum((testtarget - pred_class)^2)
r_squared <- 1 - (ss_residual / ss_total)
print(paste("R²:", r_squared))

# RMSE
rmse <- sqrt(mean((testtarget - pred_class)^2))
print(paste("RMSE:", rmse))

# MSE
mse <- mean((testtarget - pred_class)^2)
print(paste("MSE:", mse))

# Residual Mean and Residual Std
residuals <- testtarget - pred_class
residual_mean <- mean(residuals)
residual_std <- sd(residuals)
print(paste("Residual Mean:", residual_mean))
print(paste("Residual Std:", residual_std))

# Sensitivity, Specificity, and Accuracy (Binary Classification Example)
library(caret)
confusion <- confusionMatrix(factor(pred_class), factor(testtarget))
sensitivity <- confusion$byClass["Sensitivity"]
specificity <- confusion$byClass["Specificity"]
accuracy <- mean(pred_class == testtarget)
print(paste("Sensitivity:", sensitivity))
print(paste("Specificity:", specificity))
print(paste("Accuracy:", accuracy))

